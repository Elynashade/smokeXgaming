function initializeIntro() {
    if (window.introInitialized) return;
    window.introInitialized = true;

    const flash = document.getElementById('flashbang');
    const videoSource = document.getElementById('video-source');
    const videoPlayer = document.getElementById('bg-video');
    
    if (!videoPlayer) return;
    
    // Ensure video source element is cleared to favor direct src assignment
    if (videoSource) videoSource.removeAttribute('src');

    // Reset state for stability
    document.body.classList.remove('is-transitioning');
    document.body.classList.remove('video-ready');
    
    // CRITICAL: Force attributes for cross-browser "streaming" support
    videoPlayer.muted = true; 
    videoPlayer.defaultMuted = true;
    videoPlayer.setAttribute('playsinline', '');
    videoPlayer.setAttribute('webkit-playsinline', '');
    videoPlayer.setAttribute('muted', '');
    videoPlayer.setAttribute('autoplay', '');
    videoPlayer.preload = 'auto';
    if (flash) flash.style.opacity = '0';
    window.sequenceStarted = false;

    // Video Pool: High-end gaming backgrounds
    const videoPool = [
        'https://image2url.com/r2/default/videos/1775845726029-9aae2e02-3cba-403f-b6c8-cc36f08ba99a.mp4',
        'https://image2url.com/r2/default/videos/1775855750685-eb6971fd-1e0d-4037-8931-90634cefbb2d.mp4'
    ];

    // AVOID REPEAT: Check what was played last and force a different choice
    const lastVideo = sessionStorage.getItem('smokex_selected_video');
    let randomVideo;
    
    if (videoPool.length > 1) {
        do {
            randomVideo = videoPool[Math.floor(Math.random() * videoPool.length)];
        } while (randomVideo === lastVideo);
    } else {
        randomVideo = videoPool[0];
    }

    sessionStorage.setItem('smokex_selected_video', randomVideo);
    
    videoPlayer.src = randomVideo;
    videoPlayer.load();

    // Cross-browser Playback Handler
    const attemptPlay = () => {
        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // If blocked, we try again on the next frame
                requestAnimationFrame(attemptPlay);
            });
        }
    };

    // Core Optimization: Safety Timeout
    // If video fails to load in 5s, we force transition anyway to prevent "Black Screen"
    const failSafeTimeout = setTimeout(() => {
        if (!window.sequenceStarted) {
            console.warn("Video load timeout - engaging fallback transition.");
            startSequence();
        }
    }, 5000);

    const checkReady = () => {
        if (window.sequenceStarted) return;
        if (videoPlayer.readyState >= 2) {
            clearTimeout(failSafeTimeout);
            startSequence();
        } else {
            requestAnimationFrame(checkReady);
        }
    };
    
    videoPlayer.addEventListener('loadeddata', checkReady);
    videoPlayer.addEventListener('playing', checkReady);

    attemptPlay();
    checkReady();
}

function startSequence() {
    if (window.sequenceStarted) return;
    window.sequenceStarted = true;

    document.body.classList.add('video-ready');
    setTimeout(() => {
        document.body.classList.add('is-transitioning');
        const flash = document.getElementById('flashbang');
        if (flash) flash.style.opacity = '1';
        setTimeout(() => {
            window.location.href = 'landing.html';
        }, 600); 
    }, 3500); 
}

// Handle both normal load and back button (bfcache)
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.introInitialized = false; // Reset to allow re-init on back button
    }
    initializeIntro();
});

// Secondary fallback for immediate execution
if (document.readyState !== 'loading') initializeIntro();