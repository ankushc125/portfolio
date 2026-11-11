/**
 * Ankush Chakraborty — Portfolio
 * Vanilla JS: scroll reveal, nav state, phone reveal, mailto contact form.
 */


    const els = {
        navbar: document.getElementById('navbar'),
        navToggle: document.getElementById('navToggle'),
        navLinks: document.getElementById('navLinks'),
        scrollProgress: document.getElementById('scroll-progress'),
        railDots: document.querySelectorAll('.rail-dot'),
        sections: document.querySelectorAll('.section'),
        reveals: document.querySelectorAll('.reveal, .reveal-left'),
        contactForm: document.getElementById('contactForm'),
        phoneBtn: document.getElementById('phoneRevealBtn')
    };

    const PHONE_NUMBER = '+91 7980581823';

    init();

    function init() {
        localStorage.removeItem('ambient_music');
        initCopyrightYear();
        initScrollReveal();
        initSectionSpy();
        initScrollChrome();
        initScrollBehavior();
        initMobileNav();
        initContactModal();
        initContactForm();
        initExperienceTabs();
        initTypewriter();
        initResumeTracking();
    }

    function initCopyrightYear() {
        const yearEl = document.getElementById('copyrightYear');
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast-banner ${type === 'error' ? 'toast-error' : 'toast-success'}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-6px)';
            setTimeout(() => toast.remove(), 260);
        }, 3400);
    }

    window.copyContact = (value, label) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value)
                .then(() => showToast(`${label} copied to clipboard.`, 'success'))
                .catch(() => showToast(`Could not copy ${label.toLowerCase()}. Please select and copy manually.`, 'error'));
        } else {
            showToast(`Clipboard unavailable. ${label}: ${value}`, 'error');
        }
    };

    // Experience interactive tab switching
    function initExperienceTabs() {
        const nodes = document.querySelectorAll('.exp-nav-node');
        const panes = document.querySelectorAll('.exp-detail-pane');
        if (!nodes.length || !panes.length) return;

        function activateTab(index) {
            nodes.forEach((n, i) => n.classList.toggle('active', i === index));
            panes.forEach((p, i) => p.classList.toggle('active', i === index));
        }

        nodes.forEach((node, i) => {
            node.addEventListener('click', () => activateTab(i));
            node.addEventListener('mouseenter', () => activateTab(i));
        });
    }


    // Fade/slide elements in as they enter the viewport
    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        els.reveals.forEach(el => observer.observe(el));
    }

    // Track which section is active for the rail + nav links
    function initSectionSpy() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) updateActiveSection(entry.target.id);
            });
        }, { threshold: 0, rootMargin: '-20% 0px -60% 0px' });

        els.sections.forEach(sec => observer.observe(sec));
    }

    function updateActiveSection(id) {
        els.railDots.forEach(dot => dot.classList.toggle('active', dot.dataset.target === '#' + id));
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
    }

    // Scroll progress bar + navbar background on scroll
    function initScrollChrome() {
        window.addEventListener('scroll', () => {
            const scroll = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            if (els.scrollProgress) {
                els.scrollProgress.style.transform = `scaleX(${maxScroll > 0 ? scroll / maxScroll : 0})`;
            }
            if (els.navbar) {
                els.navbar.classList.toggle('scrolled', scroll > 40);
            }
        }, { passive: true });
    }

    function initScrollBehavior() {
        const anchors = document.querySelectorAll('a[href^="#"], .rail-dot');
        anchors.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href') || this.dataset.target;
                if (!targetId || targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    // Close mobile nav if open
                    if (els.navLinks && els.navLinks.classList.contains('open')) {
                        els.navLinks.classList.remove('open');
                        if (els.navToggle) els.navToggle.setAttribute('aria-expanded', 'false');
                    }
                    
                    const navbarHeight = els.navbar ? els.navbar.offsetHeight : 70;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    function initMobileNav() {
        if (!els.navToggle || !els.navLinks) return;

        function closeNav() {
            els.navLinks.classList.remove('open');
            els.navToggle.classList.remove('is-active');
            els.navToggle.setAttribute('aria-expanded', 'false');
        }

        els.navToggle.addEventListener('click', () => {
            const isOpen = els.navLinks.classList.toggle('open');
            els.navToggle.classList.toggle('is-active', isOpen);
            els.navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        document.querySelectorAll('.nav-link, .nav-resume').forEach(link => {
            link.addEventListener('click', closeNav);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && els.navLinks.classList.contains('open')) {
                closeNav();
            }
        });
    }

    const PHONE_DISPLAY = '+91 79805 81823';
    const PHONE_TEL = '+917980581823';
    const EMAIL_ADDRESS = 'ankushchakraborty1125@gmail.com';

    function revealUnlockedPhone() {
        const phoneText = document.getElementById('phoneText');
        const phoneActions = document.getElementById('phoneActions');
        const phoneCard = document.getElementById('contactPhone');

        if (phoneText) {
            phoneText.innerHTML = `<a href="tel:${PHONE_TEL}" class="contact-card-link" id="phoneLink">${PHONE_DISPLAY}</a>`;
        }
        if (phoneActions) {
            phoneActions.innerHTML = `
                <a href="tel:${PHONE_TEL}" class="contact-action-btn" onclick="event.stopPropagation()">Call Now →</a>
                <a href="https://wa.me/917980581823" target="_blank" rel="noopener noreferrer" class="contact-action-btn" onclick="event.stopPropagation()">WhatsApp</a>
                <button type="button" class="contact-action-btn" onclick="event.stopPropagation(); copyContact('${PHONE_TEL}', 'Phone number')">Copy</button>
            `;
        }
        if (phoneCard) {
            phoneCard.setAttribute('aria-label', `Call Ankush Chakraborty at ${PHONE_DISPLAY}`);
        }
    }

    // Expose functions globally for inline handlers
    window.handlePhoneCardClick = (event) => {
        if (event && event.target && event.target.closest('a, button')) {
            return;
        }
        if (localStorage.getItem('phoneRevealed') === 'true') {
            window.location.href = `tel:${PHONE_TEL}`;
        } else {
            openRevealModal('phone');
        }
    };
    window.openPhoneModal = () => openRevealModal('phone');
    window.revealEmail = () => {
        window.location.href = 'mailto:' + EMAIL_ADDRESS;
    };
    window.closeContactModal = closeRevealModal;

    function openRevealModal(type) {
        const modal = document.getElementById('contactModal');
        const targetInput = document.getElementById('revealTargetType');
        const title = document.getElementById('contactModalTitle');
        const subtitle = document.getElementById('contactModalSubtitle');
        const emailGroup = document.getElementById('mvEmailGroup');
        const phoneGroup = document.getElementById('mvPhoneGroup');
        const errorEl = document.getElementById('modalError');
        const successEl = document.getElementById('modalSuccess');

        if (!modal) return;

        if (errorEl) { errorEl.className = 'modal-status-msg'; errorEl.textContent = ''; }
        if (successEl) { successEl.className = 'modal-status-msg'; successEl.innerHTML = ''; }

        if (targetInput) targetInput.value = type || 'phone';

        if (title) title.textContent = 'Verify Your Details to View Number';
        if (subtitle) subtitle.textContent = 'Enter your details below to save your inquiry and reveal Ankush\'s clickable phone number.';
        if (emailGroup) emailGroup.style.display = 'flex';
        const emailInput = document.getElementById('mvEmail');
        if (emailInput) emailInput.required = true;
        if (phoneGroup) phoneGroup.style.display = 'flex';
        const phoneInput = document.getElementById('mvPhone');
        if (phoneInput) phoneInput.required = true;

        modal.classList.add('active');
        setTimeout(() => {
            const nameInput = document.getElementById('mvName');
            if (nameInput) nameInput.focus();
        }, 120);
    }

    function closeRevealModal() {
        const modal = document.getElementById('contactModal');
        if (modal) modal.classList.remove('active');
    }

    function initContactModal() {
        const form = document.getElementById('contactModalForm');
        const closeBtn = document.getElementById('closeModalBtn');
        const modal = document.getElementById('contactModal');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeRevealModal);
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeRevealModal();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                closeRevealModal();
            }
        });

        // Restore unlocked clickable phone number on page load if previously verified
        if (localStorage.getItem('phoneRevealed') === 'true') {
            revealUnlockedPhone();
        }

        function isValidPhone(phone) {
            const clean = phone.replace(/[\s\-\(\)\+]/g, '');
            const indianRegex = /^(?:91)?[6789]\d{9}$/;
            const globalRegex = /^[1-9]\d{6,14}$/;
            return indianRegex.test(clean) || globalRegex.test(clean);
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = (document.getElementById('mvName')?.value || '').trim();
            const email = (document.getElementById('mvEmail')?.value || '').trim();
            const phone = (document.getElementById('mvPhone')?.value || '').trim();
            const purpose = (document.getElementById('mvPurpose')?.value || '').trim();
            const errorEl = document.getElementById('modalError');
            const successEl = document.getElementById('modalSuccess');
            const submitBtn = document.getElementById('modalSubmitBtn');

            if (errorEl) { errorEl.className = 'modal-status-msg'; errorEl.textContent = ''; }
            if (successEl) { successEl.className = 'modal-status-msg'; successEl.innerHTML = ''; }

            function showError(msg) {
                if (errorEl) {
                    errorEl.textContent = msg;
                    errorEl.className = 'modal-status-msg is-error';
                }
                showToast(msg, 'error');
            }

            if (!name || name.length < 2) {
                showError('Please enter your full name.');
                return;
            }
            if (!email) {
                showError('Email address is required.');
                return;
            }
            if (!isValidEmail(email)) {
                showError('Please enter a valid email address.');
                return;
            }
            if (!phone) {
                showError('Your phone number is required.');
                return;
            }
            if (!isValidPhone(phone)) {
                showError('Please enter a valid phone number.');
                return;
            }
            if (!purpose || purpose.length < 2) {
                showError('Please enter your organization or purpose.');
                return;
            }

            let visitorType = 'Other';
            const purpLower = purpose.toLowerCase();
            if (purpLower.includes('recruit') || purpLower.includes('job') || purpLower.includes('hire') || purpLower.includes('hr')) {
                visitorType = 'Recruiter';
            } else if (purpLower.includes('research') || purpLower.includes('paper') || purpLower.includes('collaboration') || purpLower.includes('academic') || purpLower.includes('university') || purpLower.includes('professor') || purpLower.includes('sppu')) {
                visitorType = 'Researcher';
            } else if (purpLower.includes('project') || purpLower.includes('freelance') || purpLower.includes('consult')) {
                visitorType = 'Client';
            }

            const deviceType = window.innerWidth < 768 ? 'Mobile' : 'Desktop';
            const timestamp = Date.now();
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Save & Show Phone Number';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }

            // Persist searching person's information locally for Admin Dashboard
            localStorage.setItem('visitorName', name);
            localStorage.setItem('visitorEmail', email);
            localStorage.setItem('visitorPhone', phone);
            localStorage.setItem('visitorPurpose', purpose);
            localStorage.setItem('visitorLocation', 'Web Visitor');
            localStorage.setItem('visitorDevice', deviceType);
            localStorage.setItem('visitorType', visitorType);
            localStorage.setItem('siteVisited', 'true');
            localStorage.setItem('visitTimestamp', new Date(timestamp).toLocaleString());
            localStorage.setItem('phoneRevealed', 'true');

            const unlocksCount = parseInt(localStorage.getItem('phoneUnlocksCount') || '0', 10);
            localStorage.setItem('phoneUnlocksCount', String(unlocksCount + 1));

            try {
                const leads = JSON.parse(localStorage.getItem('capturedLeads') || '[]');
                leads.unshift({
                    id: 'lead_' + timestamp,
                    timestamp,
                    visitorName: name,
                    visitorEmail: email,
                    visitorPhone: phone,
                    visitorPurpose: purpose,
                    visitorType,
                    visitorLocation: 'Web Visitor',
                    device: deviceType,
                    os: navigator.platform || 'Web',
                    phoneRevealed: true,
                    resumeDownloaded: localStorage.getItem('resumeDownloaded') === 'true'
                });
                localStorage.setItem('capturedLeads', JSON.stringify(leads.slice(0, 50)));
            } catch (_) {
                // Ignore storage quota errors
            }

            // Send searching person's details straight to Ankush's email via FormSubmit (no API key required)
            let emailSent = false;
            try {
                const res = await fetch(`https://formsubmit.co/ajax/${EMAIL_ADDRESS}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        _subject: `Portfolio Phone Unlock: ${name} (${visitorType})`,
                        _template: 'table',
                        _captcha: 'false',
                        name,
                        email,
                        phone,
                        purpose,
                        visitorType,
                        device: deviceType,
                        page: window.location.href,
                        submittedAt: new Date(timestamp).toLocaleString()
                    })
                });
                emailSent = res.ok;
            } catch (_) {
                emailSent = false;
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }

            // Reveal clickable tel: number on the Phone card immediately
            revealUnlockedPhone();

            if (emailSent) {
                if (successEl) {
                    successEl.innerHTML = `Details sent! Call Ankush directly: <a href="tel:${PHONE_TEL}" class="contact-card-link">${PHONE_DISPLAY}</a>`;
                    successEl.className = 'modal-status-msg is-success';
                }
                showToast(`Details sent & number unlocked: ${PHONE_DISPLAY}`, 'success');
            } else {
                if (successEl) {
                    successEl.innerHTML = `Number unlocked: <a href="tel:${PHONE_TEL}" class="contact-card-link">${PHONE_DISPLAY}</a> (offline/network blocked email alert).`;
                    successEl.className = 'modal-status-msg is-success';
                }
                showToast(`Number unlocked: ${PHONE_DISPLAY}`, 'success');
            }
            form.reset();
        });
    }

    function initResumeTracking() {
        const resumeLinks = document.querySelectorAll('.nav-resume, a[href$="Ankush_Chakraborty_Resume.pdf"]');
        resumeLinks.forEach(resumeLink => {
            resumeLink.addEventListener('click', () => {
                localStorage.setItem('resumeDownloaded', 'true');
                const count = parseInt(localStorage.getItem('resumeDownloadCount') || '0', 10);
                localStorage.setItem('resumeDownloadCount', String(count + 1));
                if (window.telemetry) {
                    window.telemetry.logResumeDownload();
                }
                showToast('Downloading Ankush Chakraborty Resume (PDF)...', 'success');
            });
        });
    }

    // Contact form opens a pre-filled email instead of faking a "sent" state
    function initContactForm() {
        if (!els.contactForm) return;
        els.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(els.contactForm);
            const name = fd.get('name');
            const company = fd.get('company');
            const message = fd.get('message');

            const subject = `Portfolio inquiry from ${name}`;
            const body =
                `Name: ${name}\n` +
                `Organization / Purpose: ${company}\n\n` +
                `${message}`;

            const mailto = `mailto:ankushchakraborty1125@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailto;
        });
    }

    function initTypewriter() {
        const photoContainer = document.querySelector('.hero-photo-container');
        const titleEl = document.getElementById('heroName');
        const headlineEl = document.getElementById('heroHeadline');
        const coordsEl = document.getElementById('heroCoords');
        const buttonsEl = document.querySelector('.hero-buttons');
        const railDots = document.querySelector('.hero-left-rail');
        const scrollIndicator = document.querySelector('.discover-indicator');
        const aiGreeting = document.getElementById('aiGreeting');

        if (!titleEl) return;

        // 0.15s: Portrait Container Scales In, Blurs Out, and Fades In
        setTimeout(() => {
            if (photoContainer) {
                photoContainer.style.opacity = '1';
                photoContainer.style.filter = 'blur(0px)';
                photoContainer.style.transform = 'scale(1)';
            }
            startAmbientMusic();
        }, 150);

        // 0.35s: Name Animates In (Staggered Editorial Slide-Up)
        setTimeout(() => {
            const firstNameEl = document.querySelector('.hero-first-name');
            if (firstNameEl) {
                firstNameEl.style.opacity = '1';
                firstNameEl.style.transform = 'translateY(0)';
            }
        }, 350);

        setTimeout(() => {
            const lastNameEl = document.querySelector('.hero-last-name');
            if (lastNameEl) {
                lastNameEl.style.opacity = '1';
                lastNameEl.style.transform = 'translateY(0)';
            }
        }, 500);

        // 0.65s: Professional headline fades in & starts cycling
        setTimeout(() => {
            if (headlineEl) {
                headlineEl.style.opacity = '1';
                headlineEl.textContent = 'GIS Analyst';
                initHeadlineCycling();
            }
        }, 650);

        // 0.85s: Coordinates display fades in cleanly
        setTimeout(() => {
            if (coordsEl) {
                coordsEl.style.opacity = '1';
            }
        }, 850);

        // 0.95s: CTA buttons slide upward
        setTimeout(() => {
            if (buttonsEl) {
                buttonsEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                buttonsEl.style.opacity = '1';
                buttonsEl.style.transform = 'translateY(0)';
            }
        }, 950);

        // 1.1s: Social left rail fades in
        setTimeout(() => {
            if (railDots) {
                railDots.style.transition = 'opacity 0.6s ease';
                railDots.style.opacity = '1';
            }
        }, 1100);

        // 1.25s: Scroll indicator begins subtle animation
        setTimeout(() => {
            if (scrollIndicator) {
                scrollIndicator.style.transition = 'opacity 0.6s ease';
                scrollIndicator.style.opacity = '0.6';
            }
        }, 1250);

        // 2.0s: Show Assistant Greeting card (shows every new session, dismissible per session)
        setTimeout(() => {
            if (!aiGreeting) return;
            if (!sessionStorage.getItem('ai_greeting_dismissed')) {
                aiGreeting.classList.add('visible');
            }
        }, 2000);

        // Auto-dismiss greeting when user starts scrolling
        let greetingScrolled = false;
        window.addEventListener('scroll', () => {
            if (!greetingScrolled && aiGreeting && aiGreeting.classList.contains('visible')) {
                greetingScrolled = true;
                aiGreeting.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                aiGreeting.style.opacity = '0';
                aiGreeting.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    aiGreeting.classList.remove('visible');
                    aiGreeting.style.transition = '';
                    aiGreeting.style.opacity = '';
                    aiGreeting.style.transform = '';
                    sessionStorage.setItem('ai_greeting_dismissed', 'true');
                }, 400);
            }
        }, { passive: true });

        // Expose dismiss function globally
        window.dismissAiGreeting = () => {
            if (aiGreeting) {
                aiGreeting.classList.remove('visible');
                sessionStorage.setItem('ai_greeting_dismissed', 'true');
            }
        };

        // Initialize parallax
        initHeroParallax();
    }

    function initHeadlineCycling() {
        const headlineEl = document.getElementById('heroHeadline');
        if (!headlineEl) return;

        const headlines = [
            "GIS Analyst",
            "Geoinformatics Specialist",
            "Remote Sensing Specialist",
            "Spatial Analysis & Cartographer",
            "Freelancer",
            "Geography & Geospatial Science Teacher"
        ];

        let index = 0;
        setInterval(() => {
            headlineEl.style.opacity = '0';
            headlineEl.style.filter = 'blur(4px)';
            
            setTimeout(() => {
                index = (index + 1) % headlines.length;
                headlineEl.textContent = headlines[index];
                headlineEl.style.opacity = '1';
                headlineEl.style.filter = 'blur(0px)';
            }, 500);
        }, 3000);
    }

    function initHeroParallax() {
        const hero = document.getElementById('home');
        const photoContainer = document.querySelector('.hero-photo-container');
        const glow = document.querySelector('.photo-glow');
        const grid = document.querySelector('.hero-grid');
        
        if (!hero) return;
        
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const xRatio = x / (rect.width / 2);
            const yRatio = y / (rect.height / 2);
            
            if (photoContainer) {
                photoContainer.style.transform = `rotateY(${xRatio * 3}deg) rotateX(${-yRatio * 3}deg) scale(1)`;
            }
            if (glow) {
                glow.style.transform = `translate(${xRatio * 15}px, ${yRatio * 15}px)`;
            }
            if (grid) {
                grid.style.transform = `translate(${xRatio * 8}px, ${yRatio * 8}px)`;
            }
        });
        
        hero.addEventListener('mouseleave', () => {
            if (photoContainer) photoContainer.style.transform = 'scale(1)';
            if (glow) glow.style.transform = '';
            if (grid) grid.style.transform = '';
        });
    }

/* ─────────────────────────────────────────────
/* ─── AMBIENT MUSIC ─────────────────────────────── */

// Update the floating music toggle button UI
function updateMusicUI(isPlaying) {
    const floatBtn = document.getElementById('musicToggle');
    const fOff = floatBtn && floatBtn.querySelector('.music-icon-off');
    const fOn  = floatBtn && floatBtn.querySelector('.music-icon-on');
    if (floatBtn) {
        floatBtn.classList.toggle('is-playing', isPlaying);
        floatBtn.setAttribute('aria-pressed', String(isPlaying));
        if (fOff) fOff.style.display = isPlaying ? 'none' : 'flex';
        if (fOn)  fOn.style.display  = isPlaying ? 'flex' : 'none';
    }
}

function startAmbientMusic() {
    const audio = document.getElementById('ambientAudio');
    if (!audio || !audio.paused) return;

    // Try unmuted play first
    audio.muted = false;
    audio.volume = 0.18;

    audio.play().then(() => {
        // Browser allowed unmuted autoplay — music is playing with sound
        updateMusicUI(true);
    }).catch(() => {
        // Browser blocked unmuted autoplay — fallback to muted play
        audio.muted = true;
        audio.volume = 0;
        audio.play().then(() => {
            // Playing silently — will unmute on first user gesture
            updateMusicUI(true);
        }).catch(() => {
            // Even muted play blocked — will start on first gesture
        });
    });
}

function toggleAmbientMusic() {
    const audio = document.getElementById('ambientAudio');
    if (!audio) return;

    if (audio.paused) {
        // User clicked play — this is a gesture, so unmuted play works
        audio.muted = false;
        audio.volume = 0.18;
        audio.play().then(() => updateMusicUI(true)).catch(() => {});
    } else {
        // User clicked pause — stop immediately
        audio.pause();
        audio.muted = false;
        audio.volume = 0;
        updateMusicUI(false);
    }
}

// On first real user gesture (click/touch/key), unmute the audio if it's playing silently
(function initAutoPlay() {
    function onGesture(e) {
        // If clicking the music toggle button, let toggleAmbientMusic handle it
        if (e.target && typeof e.target.closest === 'function' && e.target.closest('#musicToggle')) {
            cleanup();
            return;
        }

        const audio = document.getElementById('ambientAudio');
        if (!audio) { cleanup(); return; }

        if (!audio.paused && audio.muted) {
            // Audio is playing muted — just unmute and set volume (NO play() call needed!)
            audio.muted = false;
            audio.volume = 0.18;
            cleanup();
        } else if (audio.paused) {
            // Audio never started — start it now with user gesture
            audio.muted = false;
            audio.volume = 0.18;
            audio.play().then(() => updateMusicUI(true)).catch(() => {});
            cleanup();
        } else {
            // Already playing unmuted
            cleanup();
        }
    }

    function cleanup() {
        ['click', 'keydown', 'touchstart'].forEach(ev =>
            document.removeEventListener(ev, onGesture)
        );
    }

    ['click', 'keydown', 'touchstart'].forEach(ev =>
        document.addEventListener(ev, onGesture, { passive: true })
    );
})();
