/* ============================================
   ANKUSH CHAKRABORTY — PORTFOLIO INTERACTIONS
   Scroll reveals, parallax, particles,
   animated counters, phone modal, and more
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCursorGlow();
    initNavbar();
    initScrollReveal();
    initCounters();
    initSmoothScroll();
    initAudio();
    initWelcomeModal();
    trackSiteVisit();
});

/* ---------- Floating Particles ---------- */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const count = 40;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (8 + Math.random() * 16) + 's';
        p.style.animationDelay = (Math.random() * 12) + 's';
        p.style.width = p.style.height = (1 + Math.random() * 2.5) + 'px';
        p.style.opacity = (0.15 + Math.random() * 0.35);
        container.appendChild(p);
    }
}

/* ---------- Cursor Glow ---------- */
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();
}

/* ---------- Navbar ---------- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    // Scroll transparency
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            links.classList.toggle('active');
        });

        // Close on link click
        links.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                links.classList.remove('active');
            });
        });
    }
}

/* ---------- Scroll Reveal ---------- */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ---------- Animated Counters ---------- */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1500;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

/* ---------- Smooth Scroll ---------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/* ---------- Welcome Modal (Visitor Type) ---------- */
function initWelcomeModal() {
    // Only show if the user hasn't already selected a type
    if (!localStorage.getItem('visitorType')) {
        setTimeout(() => {
            const modal = document.getElementById('welcomeModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }, 1500); // Wait 1.5 seconds before asking to avoid bombarding them immediately
    } else {
        // Personalize subtitle based on previous selection if they return
        personalizeGreeting(localStorage.getItem('visitorType'));
    }
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        localStorage.setItem('visitorType', 'Skipped'); // Record skip so we don't ask again
    }
}

function setVisitorType(type) {
    // Save to local storage
    localStorage.setItem('visitorType', type);
    
    // Close modal
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Apply personalization immediately
    personalizeGreeting(type);
}

function personalizeGreeting(type) {
    const subtitle = document.querySelector('.hero-subtitle');
    const primaryCTA = document.getElementById('heroPrimaryCTA');
    const contactSubtitle = document.getElementById('contactSubtitle');
    
    // Contact Cards for Priority Sorter
    const cEmail = document.getElementById('contactEmail');
    const cPhone = document.getElementById('contactPhone');
    const cLink = document.getElementById('contactLinkedin');
    const cLoc = document.getElementById('contactLocation');
    
    if (!subtitle) return;

    if (type === 'HR / Recruiter') {
        subtitle.innerHTML = 'Transforming geospatial data into actionable intelligence. <br><span style="color:var(--accent-1); font-weight:600;">Looking for new opportunities to drive value in forward-thinking teams.</span>';
        if (primaryCTA) {
            primaryCTA.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> View My Resume`;
            primaryCTA.href = "Ankush_Chakraborty_Resume.pdf";
            primaryCTA.target = "_blank";
        }
        if (contactSubtitle) contactSubtitle.textContent = "I'm currently open to new roles! Feel free to call or shoot me an email to request an interview.";
        // Prioritize Phone & LinkedIn for recruiters
        if(cPhone) cPhone.style.order = "-2";
        if(cLink) cLink.style.order = "-1";

    } else if (type === 'Working Professional') {
        subtitle.innerHTML = 'Transforming geospatial data into actionable intelligence. <br><span style="color:var(--accent-1); font-weight:600;">Always open to networking and collaborating on advanced spatial projects.</span>';
        if (primaryCTA) {
            primaryCTA.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> Connect on LinkedIn`;
            primaryCTA.href = "https://linkedin.com/in/ankush-chakraborty-7b9118321";
            primaryCTA.target = "_blank";
        }
        if (contactSubtitle) contactSubtitle.textContent = "Let's connect! Always happy to network with fellow professionals.";
        // Prioritize LinkedIn
        if(cLink) cLink.style.order = "-2";

    }  else if (type === 'Researcher') {
        subtitle.innerHTML = 'Transforming geospatial data into actionable intelligence. <br><span style="color:var(--accent-1); font-weight:600;">Committed to pushing the boundaries of spatial analysis and modeling.</span>';
        if (primaryCTA) {
            primaryCTA.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> Explore Projects`;
            primaryCTA.href = "#projects";
        }
        if (contactSubtitle) contactSubtitle.textContent = "Open to research collaborations and academic partnerships. Please email me to discuss.";
        if(cEmail) cEmail.style.order = "-2";

    } else {
        // 'Other' or 'Skipped' fallback
        subtitle.innerHTML = 'Transforming geospatial data into actionable intelligence. <br><span style="color:var(--accent-1); font-weight:600;">Thanks for visiting my portfolio! Let me know how I can help.</span>';
        if (contactSubtitle) contactSubtitle.textContent = "Open to research collaborations, internship opportunities, and GIS consulting projects.";
    }
}

/* ---------- Phone Reveal Modal ---------- */
function openPhoneModal() {
    const modal = document.getElementById('phoneModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePhoneModal() {
    const modal = document.getElementById('phoneModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on overlay click
document.getElementById('phoneModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closePhoneModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePhoneModal();
});

async function revealPhone(e) {
    e.preventDefault();
    const name = document.getElementById('visitorName').value.trim();
    const phone = document.getElementById('visitorPhone').value.trim();

    if (!name || !phone) return;

    // Automatically capture location using a public IP geolocation API
    let location = 'Captured silently';
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (response.ok) {
            const data = await response.json();
            const lat = data.latitude ? parseFloat(data.latitude).toFixed(4) : '?';
            const lon = data.longitude ? parseFloat(data.longitude).toFixed(4) : '?';
            location = `${data.city || 'Unknown City'}, ${data.country || 'Unknown'} (Lat: ${lat}, Lon: ${lon})`;
        }
    } catch (err) {
        console.error("Could not fetch location", err);
    }

    // Capture User Device
    const userAgent = navigator.userAgent;
    let device = "Desktop";
    if (/android/i.test(userAgent)) {
        device = "Android";
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        device = "iOS";
    } else if (/Windows/.test(userAgent)) {
        device = "Windows PC";
    } else if (/Mac/.test(userAgent)) {
        device = "Mac";
    } else if (/Linux/.test(userAgent)) {
        device = "Linux";
    }

    // Validate phone (basic: at least 7 digits)
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
        alert('Please enter a valid phone number.');
        return;
    }

    // Hide form, show number
    const form = document.getElementById('phoneRevealForm');
    const revealed = document.getElementById('phoneRevealed');
    const subtitle = document.querySelector('.modal-subtitle');
    const modalIcon = document.querySelector('.modal-icon');
    const modalTitle = document.querySelector('.modal-title');

    if (form) form.style.display = 'none';
    if (subtitle) subtitle.style.display = 'none';
    if (modalIcon) modalIcon.style.display = 'none';
    if (modalTitle) modalTitle.textContent = 'Thank you, ' + name + '!';
    if (revealed) revealed.style.display = 'block';

    // Also update the contact card to show the number directly
    const phoneCard = document.getElementById('contactPhone');
    if (phoneCard) {
        const gatedText = phoneCard.querySelector('.phone-gated-text');
        if (gatedText) {
            gatedText.innerHTML = '<a href="tel:+917980581823" style="color:var(--accent-1);">+91 798-058-1823</a>';
        }
        phoneCard.onclick = null;
        phoneCard.style.cursor = 'default';
    }

    // Save to localStorage so it stays revealed
    localStorage.setItem('phoneRevealed', 'true');
    localStorage.setItem('visitorName', name);
    localStorage.setItem('visitorLocation', location);
    localStorage.setItem('visitorDevice', device);
    localStorage.setItem('visitorPhone', phone);

    // Update greeting
    const greeting = document.getElementById('heroGreeting');
    if (greeting) {
        greeting.textContent = `Welcome back, ${name}`;
    }
}

// Check if phone was already revealed
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('phoneRevealed') === 'true') {
        const phoneCard = document.getElementById('contactPhone');
        if (phoneCard) {
            const gatedText = phoneCard.querySelector('.phone-gated-text');
            if (gatedText) {
                gatedText.innerHTML = '<a href="tel:+917980581823" style="color:var(--accent-1);">+91 798-058-1823</a>';
            }
            phoneCard.onclick = null;
            phoneCard.style.cursor = 'default';
        }

        // Apply personalized greeting if name exists
        const savedName = localStorage.getItem('visitorName');
        const greeting = document.getElementById('heroGreeting');
        if (savedName && greeting) {
            greeting.textContent = `Welcome back, ${savedName}`;
        }
    }
});

/* ---------- Ambient Audio ---------- */
function initAudio() {
    const audio = document.getElementById('ambientAudio');
    const toggle = document.getElementById('audioToggle');
    if (!audio || !toggle) return;

    const iconPlay = toggle.querySelector('.icon-play');
    const iconPause = toggle.querySelector('.icon-pause');
    const textSpan = toggle.querySelector('span');
    let isPlaying = false;

    // Set a very subtle default volume
    audio.volume = 0.2;

    toggle.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
            toggle.classList.remove('playing');
        } else {
            // Attempt to play (handles browser autoplay policies by requiring user interaction)
            audio.play().then(() => {
                iconPlay.style.display = 'none';
                iconPause.style.display = 'block';
                toggle.classList.add('playing');
            }).catch(error => {
                console.log("Audio play failed:", error);
            });
        }
        isPlaying = !isPlaying;
    });
}

/* ---------- Track Resume Download ---------- */
async function trackResumeDownload() {
    let count = parseInt(localStorage.getItem('resumeDownloadCount') || '0');
    localStorage.setItem('resumeDownloadCount', count + 1);
    localStorage.setItem('resumeDownloaded', 'true');

    // If device/location aren't captured yet, capture them silently
    if (!localStorage.getItem('visitorLocation')) {
        let location = 'Captured silently';
        try {
            const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
            if (response.ok) {
                const data = await response.json();
                const lat = data.latitude ? parseFloat(data.latitude).toFixed(4) : '?';
                const lon = data.longitude ? parseFloat(data.longitude).toFixed(4) : '?';
                location = `${data.city || 'Unknown City'}, ${data.country || 'Unknown'} (Lat: ${lat}, Lon: ${lon})`;
            }
        } catch(e) {}
        localStorage.setItem('visitorLocation', location);
    }

    if (!localStorage.getItem('visitorDevice')) {
        const userAgent = navigator.userAgent;
        let device = "Desktop";
        if (/android/i.test(userAgent)) device = "Android";
        else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) device = "iOS";
        else if (/Windows/.test(userAgent)) device = "Windows PC";
        else if (/Mac/.test(userAgent)) device = "Mac";
        else if (/Linux/.test(userAgent)) device = "Linux";
        localStorage.setItem('visitorDevice', device);
    }
}

/* ---------- Track Page Visit ---------- */
async function trackSiteVisit() {
    if (!localStorage.getItem('siteVisited')) {
        localStorage.setItem('siteVisited', 'true');
        
        const now = new Date();
        const timeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        localStorage.setItem('visitTimestamp', timeString);

        if (!localStorage.getItem('visitorLocation')) {
            let location = 'Captured silently';
            try {
                const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
                if (response.ok) {
                    const data = await response.json();
                    const lat = data.latitude ? parseFloat(data.latitude).toFixed(4) : '?';
                    const lon = data.longitude ? parseFloat(data.longitude).toFixed(4) : '?';
                    location = `${data.city || 'Unknown City'}, ${data.country || 'Unknown'} (Lat: ${lat}, Lon: ${lon})`;
                }
            } catch(e) {}
            localStorage.setItem('visitorLocation', location);
        }

        if (!localStorage.getItem('visitorDevice')) {
            const userAgent = navigator.userAgent;
            let device = "Desktop";
            if (/android/i.test(userAgent)) device = "Android";
            else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) device = "iOS";
            else if (/Windows/.test(userAgent)) device = "Windows PC";
            else if (/Mac/.test(userAgent)) device = "Mac";
            else if (/Linux/.test(userAgent)) device = "Linux";
            localStorage.setItem('visitorDevice', device);
        }
    }
}
