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
        if (!els.navToggle) return;
        els.navToggle.addEventListener('click', () => {
            const isOpen = els.navLinks.classList.toggle('open');
            els.navToggle.setAttribute('aria-expanded', String(isOpen));
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                els.navLinks.classList.remove('open');
                els.navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }    // Expose functions globally to prevent ReferenceErrors from inline onclick handlers
    window.openPhoneModal = () => openRevealModal('phone');
    window.revealEmail = (event) => {
        const emailText = document.getElementById('emailText');
        const email = 'ankushchakraborty1125@gmail.com';
        if (emailText.textContent.includes('reveal') || emailText.textContent.includes('🔒')) {
            emailText.textContent = email;
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        } else {
            window.location.href = 'mailto:' + email;
        }
    };
    window.closeContactModal = closeRevealModal;

    const EMAIL_ADDRESS = 'ankushchakraborty1125@gmail.com';

    function openRevealModal(type) {
        const modal = document.getElementById('contactModal');
        const targetInput = document.getElementById('revealTargetType');
        const title = document.getElementById('contactModalTitle');
        const subtitle = document.getElementById('contactModalSubtitle');
        const emailGroup = document.getElementById('mvEmailGroup');
        const phoneGroup = document.getElementById('mvPhoneGroup');
        
        if (!modal) return;
        
        targetInput.value = type;
        
        if (type === 'phone') {
            title.textContent = 'Unlock Phone Number';
            subtitle.textContent = 'Enter your details below to reveal Ankush\'s phone number.';
            emailGroup.style.display = 'flex';
            const emailInput = document.getElementById('mvEmail');
            if (emailInput) emailInput.required = true;
            if (phoneGroup) phoneGroup.style.display = 'none';
            const phoneInput = document.getElementById('mvPhone');
            if (phoneInput) phoneInput.required = false;
        } else {
            title.textContent = 'Unlock Email Address';
            subtitle.textContent = 'Enter your details below to reveal Ankush\'s email address.';
            if (emailGroup) emailGroup.style.display = 'none';
            const emailInput = document.getElementById('mvEmail');
            if (emailInput) emailInput.required = false;
            if (phoneGroup) phoneGroup.style.display = 'flex';
            const phoneInput = document.getElementById('mvPhone');
            if (phoneInput) phoneInput.required = true;
        }
        
        modal.classList.add('active');
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

        // Auto-reveal on load if already unlocked in localStorage
        if (localStorage.getItem('phoneRevealed') === 'true') {
            const phoneText = document.getElementById('phoneText');
            if (phoneText) {
                phoneText.innerHTML = `<a href="tel:${PHONE_NUMBER}" class="contact-revealed-link">${PHONE_NUMBER}</a>`;
            }
            const phoneCard = document.getElementById('contactPhone');
            if (phoneCard) {
                phoneCard.onclick = () => window.location.href = `tel:${PHONE_NUMBER}`;
                phoneCard.onkeydown = (ev) => { if (ev.key === 'Enter') window.location.href = `tel:${PHONE_NUMBER}`; };
            }
        }
        if (localStorage.getItem('emailRevealed') === 'true') {
            const emailText = document.getElementById('emailText');
            if (emailText) {
                emailText.innerHTML = `<a href="mailto:${EMAIL_ADDRESS}" class="contact-revealed-link">${EMAIL_ADDRESS}</a>`;
            }
            const emailCard = document.getElementById('emailCard');
            if (emailCard) {
                emailCard.onclick = () => window.location.href = `mailto:${EMAIL_ADDRESS}`;
                emailCard.onkeydown = (ev) => { if (ev.key === 'Enter') window.location.href = `mailto:${EMAIL_ADDRESS}`; };
            }
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
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = document.getElementById('revealTargetType').value;
        const name = document.getElementById('mvName').value.trim();
        const purpose = document.getElementById('mvPurpose').value.trim();
        const errorEl = document.getElementById('modalError');

        if (errorEl) {
            errorEl.style.display = 'none';
            errorEl.textContent = '';
        }

        function showError(msg) {
            if (errorEl) {
                errorEl.textContent = msg;
                errorEl.style.display = 'block';
            }
        }

        if (type === 'phone') {
            const email = document.getElementById('mvEmail').value.trim();
            if (!email) {
                showError('Email address is required.');
                return;
            }
            if (!isValidEmail(email)) {
                showError('Please enter a valid email address.');
                return;
            }
        } else {
            const phone = document.getElementById('mvPhone').value.trim();
            if (!phone) {
                showError('Phone number is required.');
                return;
            }
            if (!isValidPhone(phone)) {
                showError('Please enter a valid phone number (e.g. +91 9876543210).');
                return;
            }
        }
        
        // Determine visitor type
        let visitorType = 'Other';
        const purpLower = purpose.toLowerCase();
        if (purpLower.includes('recruit') || purpLower.includes('job') || purpLower.includes('hire') || purpLower.includes('hr')) {
            visitorType = 'Recruiter';
        } else if (purpLower.includes('research') || purpLower.includes('paper') || purpLower.includes('collaboration') || purpLower.includes('academic') || purpLower.includes('university') || purpLower.includes('professor') || purpLower.includes('sppu')) {
            visitorType = 'Researcher';
        } else if (purpLower.includes('project') || purpLower.includes('freelance') || purpLower.includes('consult')) {
            visitorType = 'Client';
        }
        
        // Set localStorage for Admin Dashboard
        localStorage.setItem('visitorName', name);
        localStorage.setItem('visitorLocation', 'Local');
        localStorage.setItem('visitorDevice', window.innerWidth < 768 ? 'Mobile' : 'Desktop');
        localStorage.setItem('visitorType', visitorType);
        localStorage.setItem('siteVisited', 'true');
        localStorage.setItem('visitTimestamp', new Date().toLocaleString());

            
            if (type === 'phone') {
                const email = document.getElementById('mvEmail').value;
                localStorage.setItem('visitorEmail', email);
                localStorage.setItem('phoneRevealed', 'true');
                
                // Increment phone unlocks statistic count for dashboard charts
                let unlocksCount = parseInt(localStorage.getItem('phoneUnlocksCount') || '0');
                localStorage.setItem('phoneUnlocksCount', String(unlocksCount + 1));
                
                // Track with Firebase Telemetry
                if (window.telemetry) {
                    window.telemetry.logPhoneUnlock(name, email, visitorType);
                }

                // Reveal Ankush's phone
                const phoneText = document.getElementById('phoneText');
                if (phoneText) {
                    phoneText.innerHTML = `<a href="tel:${PHONE_NUMBER}" class="contact-revealed-link">${PHONE_NUMBER}</a>`;
                }
                
                // Change the card behavior so next click directly calls tel:
                const phoneCard = document.getElementById('contactPhone');
                if (phoneCard) {
                    phoneCard.onclick = () => window.location.href = `tel:${PHONE_NUMBER}`;
                    phoneCard.onkeydown = (ev) => { if (ev.key === 'Enter') window.location.href = `tel:${PHONE_NUMBER}`; };
                }
            } else {
                const phone = document.getElementById('mvPhone').value;
                localStorage.setItem('visitorPhone', phone);
                localStorage.setItem('emailRevealed', 'true');
                
                // Track with Firebase Telemetry
                if (window.telemetry) {
                    window.telemetry.logPhoneUnlock(name, phone, visitorType);
                }

                // Reveal Ankush's email
                const emailText = document.getElementById('emailText');
                if (emailText) {
                    emailText.innerHTML = `<a href="mailto:${EMAIL_ADDRESS}" class="contact-revealed-link">${EMAIL_ADDRESS}</a>`;
                }
                
                // Change the card behavior so next click directly opens email
                const emailCard = document.getElementById('emailCard');
                if (emailCard) {
                    emailCard.onclick = () => window.location.href = `mailto:${EMAIL_ADDRESS}`;
                    emailCard.onkeydown = (ev) => { if (ev.key === 'Enter') window.location.href = `mailto:${EMAIL_ADDRESS}`; };
                }
            }
            
            closeRevealModal();
            form.reset();
        });
    }

    function initResumeTracking() {
        const resumeLink = document.querySelector('.nav-resume');
        if (resumeLink) {
            resumeLink.addEventListener('click', () => {
                localStorage.setItem('resumeDownloaded', 'true');
                let count = parseInt(localStorage.getItem('resumeDownloadCount') || '0');
                localStorage.setItem('resumeDownloadCount', String(count + 1));
                if (window.telemetry) {
                    window.telemetry.logResumeDownload();
                }
            });
        }
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

        // 0.8s: Portrait Container Scales In, Blurs Out, and Fades In (Music starts in sync if allowed)
        setTimeout(() => {
            if (photoContainer) {
                photoContainer.style.opacity = '1';
                photoContainer.style.filter = 'blur(0px)';
                photoContainer.style.transform = 'scale(1)';
            }
            startAmbientMusic();
        }, 800);

        // 2.0s: Name Animates In (Staggered Editorial Slide-Up)
        setTimeout(() => {
            const firstNameEl = document.querySelector('.hero-first-name');
            if (firstNameEl) {
                firstNameEl.style.opacity = '1';
                firstNameEl.style.transform = 'translateY(0)';
            }
        }, 2000);

        setTimeout(() => {
            const lastNameEl = document.querySelector('.hero-last-name');
            if (lastNameEl) {
                lastNameEl.style.opacity = '1';
                lastNameEl.style.transform = 'translateY(0)';
            }
        }, 2300);

        // 2.8s: Professional headline fades in & starts cycling
        setTimeout(() => {
            if (headlineEl) {
                headlineEl.style.opacity = '1';
                headlineEl.textContent = 'Geospatial Data Analyst';
                initHeadlineCycling();
            }
        }, 2800);

        // 3.8s: Coordinates searching animation
        setTimeout(() => {
            if (coordsEl) {
                coordsEl.style.opacity = '1';
                coordsEl.innerHTML = `<span style="color: var(--blue); display: inline-flex; align-items: center; gap: 8px;">
                    <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: ringRotate 2s linear infinite;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg>
                    🛰️ Searching Coordinates...
                </span>`;
                
                setTimeout(() => {
                    coordsEl.innerHTML = `<span style="color: var(--gold); display: inline-flex; align-items: center; gap: 8px;">
                        <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: ringRotate 1s linear infinite;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg>
                        📡 Acquiring Signal...
                    </span>`;
                }, 800);

                setTimeout(() => {
                    coordsEl.innerHTML = `<span style="color: var(--green); display: inline-flex; align-items: center; gap: 8px;">
                        <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        🗺️ Location Locked
                    </span>`;
                }, 1600);

                setTimeout(() => {
                    coordsEl.innerHTML = `
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="detail-icon">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            Kolkata, West Bengal
                        </span>
                        <span class="meta-sep">|</span>
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="detail-icon">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" />
                            </svg>
                            22.5726° N, 88.3639° E
                        </span>
                    `;
                }, 2400);
            }
        }, 3800);

        // 4.4s: CTA buttons slide upward
        setTimeout(() => {
            if (buttonsEl) {
                buttonsEl.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                buttonsEl.style.opacity = '1';
                buttonsEl.style.transform = 'translateY(0)';
            }
        }, 4400);

        // 4.8s: Social left rail fades in
        setTimeout(() => {
            if (railDots) {
                railDots.style.transition = 'opacity 0.8s ease';
                railDots.style.opacity = '1';
            }
        }, 4800);

        // 5.2s: Scroll indicator begins subtle animation
        setTimeout(() => {
            if (scrollIndicator) {
                scrollIndicator.style.transition = 'opacity 0.8s ease';
                scrollIndicator.style.opacity = '0.6';
            }
        }, 5200);

        // 3.0s: Show AI Greeting card (shows every new session, dismissible per session)
        setTimeout(() => {
            if (!aiGreeting) return;
            if (!sessionStorage.getItem('ai_greeting_dismissed')) {
                aiGreeting.classList.add('visible');
            }
        }, 3000);

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
            "Geospatial Data Analyst",
            "GIS Professional",
            "Remote Sensing Specialist",
            "Spatial Intelligence Explorer",
            "Cartographer",
            "Earth Observation Enthusiast"
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
