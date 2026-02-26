// dashboard.js - Logic for Analytics Dashboard

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('adminUnlocked') === 'true') {
        const overlay = document.getElementById('adminOverlay');
        if (overlay) overlay.style.display = 'none';
        loadDashboardData();
    }
});

function checkAdminPin() {
    const pin = document.getElementById('adminPin').value;
    if (pin === 'ankush@125') {
        sessionStorage.setItem('adminUnlocked', 'true');
        const overlay = document.getElementById('adminOverlay');
        if (overlay) overlay.style.opacity = '0';
        setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 400);
        loadDashboardData();
    } else {
        const err = document.getElementById('adminError');
        if (err) err.style.display = 'block';
    }
}

function loadDashboardData() {
    // 1. Check if user unlocked the phone
    const hasRevealedPhone = localStorage.getItem('phoneRevealed') === 'true';
    const hasDownloadedResume = localStorage.getItem('resumeDownloaded') === 'true';
    const hasVisited = localStorage.getItem('siteVisited') === 'true';

    const visitorName = localStorage.getItem('visitorName') || 'Anonymous Visitor';
    const visitorLocation = localStorage.getItem('visitorLocation') || 'Not provided';
    const visitorDevice = localStorage.getItem('visitorDevice') || 'Unknown';
    const visitorPhone = localStorage.getItem('visitorPhone') || '-';
    const visitorType = localStorage.getItem('visitorType') || 'Unknown';
    const resumeCount = localStorage.getItem('resumeDownloadCount') || '0';
    
    // Update KPI numbers
    const unlocksEl = document.getElementById('valUnlocks');
    const typeEl = document.getElementById('valVisitorType');
    const downloadsEl = document.getElementById('valDownloads');

    if (typeEl) {
        typeEl.textContent = visitorType;
    }

    if (downloadsEl) {
        downloadsEl.textContent = resumeCount;
    }
    
    // 2. Populate Table if they have unlocked or downloaded
    const tableBody = document.getElementById('leadsTableBody');
    tableBody.innerHTML = ''; // prevent duplicates

    const now = new Date();
    const timeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

    let dataAdded = false;

    if (hasRevealedPhone && visitorPhone !== '-') {
        dataAdded = true;
        if (unlocksEl) unlocksEl.textContent = "1";
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="color:var(--text-muted); font-size:0.8rem;">${timeString}</span></td>
            <td><strong>${visitorName}</strong></td>
            <td>${visitorLocation}</td>
            <td>${visitorDevice}</td>
            <td><a href="tel:${visitorPhone}" style="color:var(--text-primary);">${visitorPhone}</a></td>
            <td><span class="status-badge">Unlocked Phone</span></td>
        `;
        tableBody.appendChild(row);
    }

    if (hasDownloadedResume) {
        dataAdded = true;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="color:var(--text-muted); font-size:0.8rem;">${timeString}</span></td>
            <td><strong>${visitorName}</strong></td>
            <td>${visitorLocation}</td>
            <td>${visitorDevice}</td>
            <td><span style="color:var(--text-muted);">${visitorPhone}</span></td>
            <td><span class="status-badge" style="background:rgba(124, 58, 237, 0.1); color:var(--accent-2);">Downloaded Resume</span></td>
        `;
        tableBody.appendChild(row);
    }

    // Explicitly Only include if they "logged in" their role, and haven't done the other higher priority actions
    if (visitorType !== 'Unknown' && !hasRevealedPhone && !hasDownloadedResume) {
        dataAdded = true;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="color:var(--text-muted); font-size:0.8rem;">${localStorage.getItem('visitTimestamp') || timeString}</span></td>
            <td><strong>${visitorName}</strong></td>
            <td>${visitorLocation}</td>
            <td>${visitorDevice}</td>
            <td><span style="color:var(--text-muted);">-</span></td>
            <td><span class="status-badge" style="background:rgba(255, 255, 255, 0.05); color:var(--text-primary); border:1px solid var(--border-glass);">Logged In (${visitorType})</span></td>
        `;
        tableBody.appendChild(row);
    }

    if (!dataAdded) {
        // Show empty state
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 40px; color: var(--text-muted);">
                    No leads collected yet. Submit the phone form or download a resume on the main page to see data here.
                </td>
            </tr>
        `;
    }

    // 3. Initialize Visual Charts
    if (!window.chartsInitialized) {
        window.chartsData = buildChartData(hasRevealedPhone, resumeCount, visitorDevice, visitorType, visitorLocation);
        window.chartsInstances = {};
        window.chartsInitialized = true;
    }
    updateCharts();
}

function buildChartData(unlocked, resumeCount, device, type, location) {
    const data = [];
    
    // Only add a real data point if the visitor took a meaningful action:
    // 1. Selected their visitor type (logged in via survey)
    // 2. Unlocked phone number
    // 3. Downloaded resume
    if (type !== 'Unknown' || unlocked || parseInt(resumeCount) > 0) {
        data.push({
            date: new Date(localStorage.getItem('visitTimestamp') || Date.now()),
            type: type !== 'Unknown' ? type : 'Other',
            location: location,
            unlocked: unlocked,
            downloaded: parseInt(resumeCount) > 0,
            device: device
        });
    }
    
    return data;
}

function updateCharts() {
    const dateFilter = document.getElementById('slicerDate')?.value || 'all';
    const locFilter = document.getElementById('slicerLocation')?.value || 'all';
    
    let filtered = window.chartsData.filter(item => {
        let passDate = true;
        let passLoc = true;
        
        const now = new Date();
        const diffDays = (now - item.date) / (1000 * 3600 * 24);
        
        if (dateFilter === 'today') passDate = diffDays < 1;
        else if (dateFilter === 'week') passDate = diffDays <= 7;
        else if (dateFilter === 'month') passDate = diffDays <= 30;
        
        if (locFilter === 'us') passLoc = item.location.includes('United States');
        else if (locFilter === 'in') passLoc = item.location.includes('India');
        else if (locFilter === 'uk') passLoc = item.location.includes('United Kingdom');
        else if (locFilter === 'local') passLoc = item.location === window.chartsData[0].location; // Matches real user
        
        return passDate && passLoc;
    });

    renderCharts(filtered);
}

function renderCharts(data) {
    Chart.defaults.color = "rgba(255, 255, 255, 0.5)";
    Chart.defaults.font.family = "'Inter', sans-serif";
    
    Object.values(window.chartsInstances).forEach(chart => chart.destroy());

    // Update the Total Visitors metric based on the filtered legitimate leads
    const visitorsEl = document.getElementById('valVisitors');
    if (visitorsEl) visitorsEl.textContent = data.length;

    // Aggregate Data
    const locCounts = {};
    const typeCounts = {};
    const unlocksByDate = {};
    const downloadsByDate = {};

    data.forEach(d => {
        // Location
        const loc = d.location.split(',')[0]; // City or broad Country
        locCounts[loc] = (locCounts[loc] || 0) + 1;
        // Types
        typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
        
        // Dates
        const dateStr = d.date.toLocaleDateString();
        if(!unlocksByDate[dateStr]) unlocksByDate[dateStr] = 0;
        if(!downloadsByDate[dateStr]) downloadsByDate[dateStr] = 0;
        
        if(d.unlocked) unlocksByDate[dateStr]++;
        if(d.downloaded) downloadsByDate[dateStr]++;
    });

    // 1. Location (Pie)
    window.chartsInstances.loc = new Chart(document.getElementById('locationChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(locCounts).slice(0, 5),
            datasets: [{ data: Object.values(locCounts).slice(0, 5), backgroundColor: ['#00d4ff', '#7c3aed', '#3b82f6', '#10b981', '#f59e0b'], borderWidth: 2, borderColor: '#050510' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });

    // 2. Primary Visitors (Doughnut)
    window.chartsInstances.vis = new Chart(document.getElementById('visitorsChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(typeCounts),
            datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#00d4ff', '#7c3aed', '#3b82f6', '#10b981', '#f59e0b'], borderWidth: 2, borderColor: '#050510' }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right' } } }
    });

    // 3. Unlocks (Line)
    const sortedDates = Object.keys(unlocksByDate).sort((a,b) => new Date(a) - new Date(b));
    window.chartsInstances.unl = new Chart(document.getElementById('unlocksChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{ label: 'Unlocks', data: sortedDates.map(d => unlocksByDate[d]), borderColor: '#00d4ff', backgroundColor: 'rgba(0, 212, 255, 0.1)', fill: true, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display:false } }, scales: { y: { beginAtZero:true, ticks: {stepSize:1} } } }
    });

    // 4. Downloads (Bar)
    window.chartsInstances.dl = new Chart(document.getElementById('downloadsChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: sortedDates,
            datasets: [{ label: 'Downloads', data: sortedDates.map(d => downloadsByDate[d]), backgroundColor: '#7c3aed', borderRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display:false } }, scales: { y: { beginAtZero:true, ticks: {stepSize:1} } } }
    });
}

function clearData() {
    if(confirm("Are you sure you want to clear your local storage data? This will reset your name and phone number on the site.")) {
        localStorage.removeItem('phoneRevealed');
        localStorage.removeItem('resumeDownloaded');
        localStorage.removeItem('resumeDownloadCount');
        localStorage.removeItem('visitorName');
        localStorage.removeItem('visitorLocation');
        localStorage.removeItem('visitorDevice');
        localStorage.removeItem('visitorPhone');
        localStorage.removeItem('visitorType');
        localStorage.removeItem('siteVisited');
        localStorage.removeItem('visitTimestamp');
        sessionStorage.removeItem('adminUnlocked');
        alert("Data cleared. Refreshing dashboard...");
        window.location.reload();
    }
}
