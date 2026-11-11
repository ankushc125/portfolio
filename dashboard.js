function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// SHA-256 hashing helper using Web Crypto API
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function showDashboardNotice(message, type = 'success') {
    const el = document.getElementById('dashboardNotice');
    if (!el) return;
    el.textContent = message;
    el.className = `dashboard-notice ${type === 'error' ? 'is-error' : 'is-success'}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('copyrightYear');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    if (sessionStorage.getItem('adminUnlocked') === 'true') {
        const overlay = document.getElementById('adminOverlay');
        if (overlay) overlay.style.display = 'none';
        loadDashboardData();
    }
});

async function checkAdminPin() {
    const pinInput = document.getElementById('adminPin');
    const pin = pinInput ? pinInput.value : '';
    const err = document.getElementById('adminError');
    const ok = document.getElementById('adminSuccess');

    if (err) err.style.display = 'none';
    if (ok) ok.style.display = 'none';

    if (!pin) {
        if (err) {
            err.textContent = 'Please enter the admin passcode.';
            err.style.display = 'block';
        }
        return;
    }

    const hashedPin = await sha256(pin);
    if (hashedPin === '590a0e6b19a5e1c130cfb6706c63f4d15d51f1db6e6290e21b65c854901d1a4f') {
        sessionStorage.setItem('adminUnlocked', 'true');
        if (ok) ok.style.display = 'block';
        const overlay = document.getElementById('adminOverlay');
        setTimeout(() => {
            if (overlay) overlay.style.opacity = '0';
            setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 350);
            loadDashboardData();
            showDashboardNotice('Dashboard unlocked successfully.', 'success');
        }, 300);
    } else {
        if (err) {
            err.textContent = 'Incorrect passcode. Please try again.';
            err.style.display = 'block';
        }
    }
}

// Global reference to store active data for filters
window.activeTelemetryData = [];
window.chartsInstances = {};

function loadDashboardData() {
    const isConfigured = typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY";

    if (!isConfigured || !db) {
        const tag = document.querySelector('.section-tag');
        if (tag) tag.textContent = "Local Leads Mode (Email Alerts Active via FormSubmit)";
        loadLocalLeadsData();
        return;
    }

    const tag = document.querySelector('.section-tag');
    if (tag) tag.textContent = "Live Database Mode";

    // Query Firebase Realtime Database
    db.ref('visitors').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            window.activeTelemetryData = [];
            renderCharts([]);
            displayEmptyState("No live visitor records in Firebase yet.");
            return;
        }

        // Map Firebase Object-of-Objects to Array
        const rawData = Object.keys(data).map(key => {
            const item = data[key];
            return {
                id: key,
                ...item,
                date: new Date(item.timestamp || Date.now())
            };
        });

        // Sort by timestamp descending (newest first)
        rawData.sort((a, b) => b.date - a.date);

        window.activeTelemetryData = rawData;
        updateDashboardView();
    }, (error) => {
        console.error("Firebase read failure:", error);
        displayEmptyState("Read error or Access Denied. Check Firebase Rules.");
    });
}

function updateDashboardView() {
    const dateFilter = document.getElementById('slicerDate')?.value || 'all';
    const locFilter = document.getElementById('slicerLocation')?.value || 'all';

    let filtered = window.activeTelemetryData.filter(item => {
        let passDate = true;
        let passLoc = true;

        const now = new Date();
        const diffDays = (now - item.date) / (1000 * 3600 * 24);

        if (dateFilter === 'today') passDate = diffDays < 1;
        else if (dateFilter === 'week') passDate = diffDays <= 7;
        else if (dateFilter === 'month') passDate = diffDays <= 30;

        if (locFilter === 'us') passLoc = item.visitorLocation?.toLowerCase().includes('united states');
        else if (locFilter === 'in') passLoc = item.visitorLocation?.toLowerCase().includes('india');
        else if (locFilter === 'uk') passLoc = item.visitorLocation?.toLowerCase().includes('united kingdom');
        else if (locFilter === 'local') passLoc = item.ip === '127.0.0.1' || item.visitorLocation?.toLowerCase().includes('kolkata');

        return passDate && passLoc;
    });

    // 1. Calculate and update KPI Cards
    const totalVisitors = filtered.length;
    const phoneUnlocks = filtered.filter(item => item.phoneRevealed).length;
    const resumeDownloads = filtered.filter(item => item.resumeDownloaded).length;
    
    // Find primary visitor type
    const typeFrequencies = {};
    filtered.forEach(item => {
        const t = item.visitorType || 'Unknown';
        if (t !== 'Unknown') {
            typeFrequencies[t] = (typeFrequencies[t] || 0) + 1;
        }
    });
    let topType = 'Unknown';
    let maxFreq = 0;
    for (const [type, freq] of Object.entries(typeFrequencies)) {
        if (freq > maxFreq) {
            maxFreq = freq;
            topType = type;
        }
    }

    document.getElementById('valVisitors').textContent = totalVisitors;
    document.getElementById('valUnlocks').textContent = phoneUnlocks;
    document.getElementById('valDownloads').textContent = resumeDownloads;
    document.getElementById('valVisitorType').textContent = topType;

    // 2. Populate Leads Table
    const tableBody = document.getElementById('leadsTableBody');
    tableBody.innerHTML = '';

    if (filtered.length === 0) {
        renderCharts([]);
        displayEmptyState();
        return;
    }

    filtered.forEach(item => {
        const row = document.createElement('tr');
        const timeString = item.date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const safeName = escapeHtml(item.visitorName || 'Anonymous Visitor');
        const safeLocation = escapeHtml(item.visitorLocation || 'Not provided');
        const safeDevice = escapeHtml(item.device || 'Unknown');
        const safeOs = escapeHtml(item.os || 'Unknown');
        const safeType = escapeHtml(item.visitorType || 'Other');
        const safePhone = escapeHtml(item.visitorPhone || '');
        const safeTel = String(item.visitorPhone || '').replace(/[^\d+]/g, '');

        let statusBadge = '';
        if (item.phoneRevealed) {
            statusBadge = '<span class="status-badge">Unlocked Phone</span>';
        } else if (item.resumeDownloaded) {
            statusBadge = '<span class="status-badge" style="background:rgba(124, 58, 237, 0.1); color:var(--accent-2);">Downloaded Resume</span>';
        } else {
            statusBadge = `<span class="status-badge" style="background:rgba(255, 255, 255, 0.05); color:var(--text-primary); border:1px solid var(--border-glass);">Logged In (${safeType})</span>`;
        }

        const visitorMeta = [item.visitorEmail, item.visitorPurpose]
            .filter(v => v && v !== '-')
            .map(escapeHtml)
            .join(' &middot; ');

        row.innerHTML = `
            <td><span style="color:var(--text-muted); font-size:0.8rem;">${escapeHtml(timeString)}</span></td>
            <td>
                <strong>${safeName}</strong>
                ${visitorMeta ? `<div style="color:var(--text-muted); font-size:0.75rem; margin-top:2px;">${visitorMeta}</div>` : ''}
            </td>
            <td>${safeLocation}</td>
            <td>${safeDevice} (${safeOs})</td>
            <td>${item.phoneRevealed && safePhone && safePhone !== '-' ? `<a href="tel:${safeTel}" style="color:var(--accent-1);">${safePhone}</a>` : `<span style="color:var(--text-muted);">-</span>`}</td>
            <td>${statusBadge}</td>
        `;
        tableBody.appendChild(row);
    });

    // 4. Render Visual Charts
    renderCharts(filtered);
}

function renderCharts(data) {
    Chart.defaults.color = "rgba(255, 255, 255, 0.5)";
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    // Destroy previous chart instances to prevent overlap bugs
    Object.keys(window.chartsInstances).forEach(key => {
        if (window.chartsInstances[key]) window.chartsInstances[key].destroy();
    });



    // Aggregate data details
    const locCounts = {};
    const typeCounts = {};
    const unlocksByDate = {};
    const downloadsByDate = {};
    
    // Geographical breakdowns for India and West Bengal
    const indiaStateCounts = {};
    const wbDistrictCounts = {};

    data.forEach(d => {
        // Location mapping
        let loc = 'Unknown';
        if (d.visitorLocation && d.visitorLocation !== 'Loading location...' && d.visitorLocation !== 'Failed to fetch') {
            const parts = d.visitorLocation.split(',').map(p => p.trim());
            loc = parts[parts.length - 1]; // Country name
            locCounts[loc] = (locCounts[loc] || 0) + 1;

            // If visitor is from India, extract State and District/City
            if (loc.toLowerCase() === 'india' && parts.length > 1) {
                const state = parts[parts.length - 2];
                indiaStateCounts[state] = (indiaStateCounts[state] || 0) + 1;

                if (state.toLowerCase() === 'west bengal' && parts.length > 2) {
                    const district = parts[parts.length - 3];
                    wbDistrictCounts[district] = (wbDistrictCounts[district] || 0) + 1;
                }
            }
        } else {
            locCounts[loc] = (locCounts[loc] || 0) + 1;
        }

        // Visitor types
        const t = d.visitorType || 'Unknown';
        typeCounts[t] = (typeCounts[t] || 0) + 1;

        // Timelines (keyed by ISO date YYYY-MM-DD for accurate chronological sorting)
        const isoDate = d.date.toISOString().slice(0, 10);
        if (!unlocksByDate[isoDate]) unlocksByDate[isoDate] = 0;
        if (!downloadsByDate[isoDate]) downloadsByDate[isoDate] = 0;

        if (d.phoneRevealed) unlocksByDate[isoDate]++;
        if (d.resumeDownloaded) downloadsByDate[isoDate]++;
    });

    // 1. Locations (Pie Chart)
    const locCtx = document.getElementById('locationChart')?.getContext('2d');
    if (locCtx) {
        window.chartsInstances.loc = new Chart(locCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(locCounts).slice(0, 5),
                datasets: [{ 
                    data: Object.values(locCounts).slice(0, 5), 
                    backgroundColor: ['#00d4ff', '#7c3aed', '#3b82f6', '#10b981', '#f59e0b'], 
                    borderWidth: 2, 
                    borderColor: '#050510' 
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
    }

    // 2. Primary Visitors (Doughnut Chart)
    const visCtx = document.getElementById('visitorsChart')?.getContext('2d');
    if (visCtx) {
        window.chartsInstances.vis = new Chart(visCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{ 
                    data: Object.values(typeCounts), 
                    backgroundColor: ['#00d4ff', '#7c3aed', '#3b82f6', '#10b981', '#f59e0b'], 
                    borderWidth: 2, 
                    borderColor: '#050510' 
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right' } } }
        });
    }

    // 3. Unlocks Timeline (Line Chart)
    const unlCtx = document.getElementById('unlocksChart')?.getContext('2d');
    const sortedDates = Object.keys(unlocksByDate).sort();
    const dateLabels = sortedDates.length
        ? sortedDates.map(iso => new Date(iso + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' }))
        : ['No Data'];
    if (unlCtx) {
        window.chartsInstances.unl = new Chart(unlCtx, {
            type: 'line',
            data: {
                labels: dateLabels,
                datasets: [{ 
                    label: 'Unlocks', 
                    data: sortedDates.length ? sortedDates.map(d => unlocksByDate[d]) : [0], 
                    borderColor: '#00d4ff', 
                    backgroundColor: 'rgba(0, 212, 255, 0.1)', 
                    fill: true, 
                    tension: 0.4 
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
    }

    // 4. Downloads Timeline (Bar Chart)
    const dlCtx = document.getElementById('downloadsChart')?.getContext('2d');
    if (dlCtx) {
        window.chartsInstances.dl = new Chart(dlCtx, {
            type: 'bar',
            data: {
                labels: dateLabels,
                datasets: [{ 
                    label: 'Downloads', 
                    data: sortedDates.length ? sortedDates.map(d => downloadsByDate[d]) : [0], 
                    backgroundColor: '#7c3aed', 
                    borderRadius: 4 
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
    }

    // 5. India State-wise (Horizontal Bar Chart)
    const indiaCtx = document.getElementById('indiaStateChart')?.getContext('2d');
    if (indiaCtx) {
        // Sort states by count descending
        const statesSorted = Object.keys(indiaStateCounts).sort((a, b) => indiaStateCounts[b] - indiaStateCounts[a]);
        window.chartsInstances.india = new Chart(indiaCtx, {
            type: 'bar',
            data: {
                labels: statesSorted.length ? statesSorted : ['No India Data'],
                datasets: [{
                    label: 'Visitors',
                    data: statesSorted.length ? statesSorted.map(s => indiaStateCounts[s]) : [0],
                    backgroundColor: '#f59e0b',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal bars
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // 6. West Bengal District/City-wise (Bar Chart)
    const wbCtx = document.getElementById('wbDistrictChart')?.getContext('2d');
    if (wbCtx) {
        // Sort districts by count descending
        const districtsSorted = Object.keys(wbDistrictCounts).sort((a, b) => wbDistrictCounts[b] - wbDistrictCounts[a]);
        window.chartsInstances.wb = new Chart(wbCtx, {
            type: 'bar',
            data: {
                labels: districtsSorted.length ? districtsSorted : ['No WB Data'],
                datasets: [{
                    label: 'Visitors',
                    data: districtsSorted.length ? districtsSorted.map(d => wbDistrictCounts[d]) : [0],
                    backgroundColor: '#10b981',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
}

function displayEmptyState(message = "No visitor records matched your filter criteria.") {
    const tableBody = document.getElementById('leadsTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 60px; color: var(--text-muted); font-size: 0.9rem;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px; opacity:0.5;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <br>${escapeHtml(message)}
                </td>
            </tr>
        `;
    }
    
    // Clear metrics cards
    document.getElementById('valVisitors').textContent = '0';
    document.getElementById('valUnlocks').textContent = '0';
    document.getElementById('valDownloads').textContent = '0';
    document.getElementById('valVisitorType').textContent = '-';
}

// Load only real captured visitor/lead records from local storage (no fake/mock data)
function loadLocalLeadsData() {
    const realData = [];

    try {
        const storedLeads = JSON.parse(localStorage.getItem('capturedLeads') || '[]');
        storedLeads.forEach(lead => {
            realData.push({
                ...lead,
                date: new Date(lead.timestamp || Date.now())
            });
        });
    } catch (_) {
        // Ignore storage errors
    }

    realData.sort((a, b) => b.date - a.date);
    window.activeTelemetryData = realData;

    if (realData.length === 0) {
        renderCharts([]);
        displayEmptyState("No visitor records yet. Real inquiries and unlocks will appear here.");
        return;
    }

    updateDashboardView();
}

function clearData() {
    const isConfigured = typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY";

    if (!isConfigured || !db) {
        if (confirm("Clear all locally saved visitor and inquiry records?")) {
            [
                'capturedLeads', 'visitorName', 'visitorEmail', 'visitorPhone',
                'visitorPurpose', 'visitorLocation', 'visitorDevice', 'visitorType',
                'siteVisited', 'visitTimestamp', 'phoneRevealed', 'phoneUnlocksCount',
                'resumeDownloaded', 'resumeDownloadCount'
            ].forEach(k => localStorage.removeItem(k));
            loadLocalLeadsData();
            showDashboardNotice("All local analytics and lead records cleared.", "success");
        }
        return;
    }

    if (confirm("WARNING: Are you sure you want to clear ALL live telemetry and leads data from Firebase? This cannot be undone.")) {
        Promise.all([db.ref('visitors').remove(), db.ref('leads').remove()])
            .then(() => {
                localStorage.removeItem('capturedLeads');
                showDashboardNotice("All Firebase telemetry and leads cleared successfully.", "success");
                setTimeout(() => window.location.reload(), 900);
            })
            .catch(err => {
                showDashboardNotice("Failed to clear database logs: " + err.message, "error");
            });
    }
}
