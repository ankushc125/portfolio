// tracker.js - Client-side telemetry tracking for Ankush Chakraborty's Portfolio

(function() {
    // Generate/Retrieve unique session ID
    let sessionId = sessionStorage.getItem('portfolio_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('portfolio_session_id', sessionId);
    }

    const loadTime = Date.now();

    // Browser/Device detection utilities
    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return "Mobile";
        return "Desktop";
    }

    function getOS() {
        const ua = navigator.userAgent;
        if (ua.indexOf("Win") !== -1) return "Windows";
        if (ua.indexOf("Mac") !== -1) return "MacOS";
        if (ua.indexOf("Linux") !== -1) return "Linux";
        if (ua.indexOf("Android") !== -1) return "Android";
        if (ua.indexOf("like Mac") !== -1) return "iOS";
        return "Unknown OS";
    }

    function getBrowser() {
        const ua = navigator.userAgent;
        let tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    }

    // Initialize visitor data structure
    const visitorData = {
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        device: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screenRes: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer || "Direct",
        duration: 0,
        phoneRevealed: false,
        resumeDownloaded: false,
        visitorName: "Anonymous Visitor",
        visitorPhone: "-",
        visitorLocation: "Loading location...",
        visitorType: "Unknown"
    };

    // Reference to this session's database node
    let sessionRef = null;

    // Connect to Firebase and publish initial record
    function initTracker() {
        if (typeof db === 'undefined' || !db) {
            console.warn("Firebase Database is not initialized. Telemetry tracking disabled.");
            return;
        }

        sessionRef = db.ref('visitors/' + sessionId);

        // Fetch location data from free IP API
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                visitorData.ip = data.ip || "Hidden";
                visitorData.visitorLocation = `${data.city || 'Unknown City'}, ${data.region || ''}, ${data.country_name || 'Unknown Country'}`;
                
                // If local storage has previous values, merge them in case of page reload within same session
                const savedName = localStorage.getItem('visitorName');
                if (savedName) visitorData.visitorName = savedName;
                const savedPhone = localStorage.getItem('visitorPhone');
                if (savedPhone) visitorData.visitorPhone = savedPhone;
                const savedType = localStorage.getItem('visitorType');
                if (savedType) visitorData.visitorType = savedType;
                const savedRevealed = localStorage.getItem('phoneRevealed') === 'true';
                if (savedRevealed) visitorData.phoneRevealed = true;
                const savedDownloaded = localStorage.getItem('resumeDownloaded') === 'true';
                if (savedDownloaded) visitorData.resumeDownloaded = true;

                sessionRef.update({
                    ip: visitorData.ip,
                    visitorLocation: visitorData.visitorLocation,
                    visitorName: visitorData.visitorName,
                    visitorPhone: visitorData.visitorPhone,
                    visitorType: visitorData.visitorType,
                    phoneRevealed: visitorData.phoneRevealed,
                    resumeDownloaded: visitorData.resumeDownloaded
                });
            })
            .catch(err => {
                console.error("Failed to retrieve location details:", err);
                visitorData.ip = "Error";
                visitorData.visitorLocation = "Failed to fetch";
                sessionRef.update({
                    ip: visitorData.ip,
                    visitorLocation: visitorData.visitorLocation
                });
            });

        // Set baseline info
        sessionRef.set(visitorData);

        // Periodically update duration (every 10 seconds)
        setInterval(() => {
            const elapsed = Math.round((Date.now() - loadTime) / 1000);
            if (sessionRef) {
                sessionRef.child('duration').set(elapsed);
            }
        }, 10000);

        // Keep page duration up-to-date on unload
        window.addEventListener('beforeunload', () => {
            const elapsed = Math.round((Date.now() - loadTime) / 1000);
            if (sessionRef) {
                sessionRef.child('duration').set(elapsed);
            }
        });
    }

    // Expose helpers globally to hook into event actions
    window.telemetry = {
        logPhoneUnlock: function(name, phone, role) {
            if (!sessionRef) return;
            sessionRef.update({
                phoneRevealed: true,
                visitorName: name,
                visitorPhone: phone,
                visitorType: role
            });
        },
        logResumeDownload: function() {
            if (!sessionRef) return;
            sessionRef.update({
                resumeDownloaded: true
            });
        }
    };

    // Run on script load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracker);
    } else {
        initTracker();
    }
})();
