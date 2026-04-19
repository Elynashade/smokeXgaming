const switchCtn = document.querySelector("#switch-cnt");
const switchC1 = document.querySelector("#switch-c1");
const switchC2 = document.querySelector("#switch-c2");
const switchCircle = document.querySelectorAll(".switch__circle");
const switchBtn = document.querySelectorAll(".switch-btn");
const aContainer = document.querySelector("#a-container");
const bContainer = document.querySelector("#b-container");

let isSignIn = true;
let isVerifyingSignUp = false;

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbym38ItogN-uwuFv3_jBhmi128a649Y5hUqx1oF4BcHI6ZdjOEdcJZ22ISz2RUxV89sNg/exec";

const changeForm = (instant = false) => {
    if (!instant && gsap.isTweening(switchCtn)) return;
    
    const mainElement = document.querySelector('.main');
    if (!mainElement) return;

    // Calculate dynamic move distance based on current container width
    const mainWidth = mainElement.offsetWidth;
    const switchWidth = switchCtn.offsetWidth;
    const moveDistance = mainWidth - switchWidth;
    const dur = instant ? 0 : 1.1;

    isSignIn = !isSignIn;
    const tl = gsap.timeline({ 
        defaults: { duration: dur, ease: "power4.inOut" },
        onStart: () => {
            // Remove active class from both during transition to prevent double-clicks
            aContainer.classList.remove('is-active-form');
            bContainer.classList.remove('is-active-form');
        }
    });

    // 1. Animate Switch Panel with a slight "stretch" effect
    tl.to(switchCtn, { 
        x: isSignIn ? 0 : moveDistance, 
        scaleX: 1.05, 
        duration: dur / 2 
    }, 0);
    tl.to(switchCtn, { scaleX: 1, duration: dur / 2 }, dur / 2);
    
    // 2. Animate Circles inside Switch for depth
    tl.to(switchCircle, { 
        rotation: isSignIn ? 0 : 270, 
        x: isSignIn ? 0 : 30, 
        duration: dur 
    }, 0);

    // 3. Swap Switch Content (Welcome vs New Member)
    const hiddenContent = switchCtn.querySelector(".switch__container.is-hidden");
    const visibleContent = switchCtn.querySelector(".switch__container:not(.is-hidden)");

    tl.to(visibleContent, { autoAlpha: 0, y: isSignIn ? 30 : -30, duration: dur * 0.3 }, 0);
    
    tl.set(hiddenContent, { y: isSignIn ? -30 : 30 }, dur * 0.3);
    tl.to(hiddenContent, { autoAlpha: 1, y: 0, duration: dur * 0.5 }, dur * 0.4);

    tl.call(() => {
        visibleContent.classList.add("is-hidden");
        hiddenContent.classList.remove("is-hidden");
    }, 0.4);

    // 4. Transform Form Containers (Blocking Fix)
    // We move the containers by the width of the switch (approx 40% of main)
    const formShift = switchWidth; 

    if (isSignIn) {
        tl.to(aContainer, { x: 0, autoAlpha: 0, scale: 0.95 }, 0);
        tl.to(bContainer, { x: 0, autoAlpha: 1, scale: 1 }, 0);
        tl.call(() => bContainer.classList.add('is-active-form'), null, 0.6);
    } else {
        tl.to(bContainer, { x: -formShift, autoAlpha: 0, scale: 0.95 }, 0);
        tl.to(aContainer, { x: -formShift, autoAlpha: 1, scale: 1 }, 0);
        tl.call(() => aContainer.classList.add('is-active-form'), null, 0.6);
    }

    // Handle Z-Index swap mid-way through animation
    tl.set(isSignIn ? bContainer : aContainer, { zIndex: 100 }, 0.5);
    tl.set(isSignIn ? aContainer : bContainer, { zIndex: 0 }, 0.5);
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Checking...";
    btn.disabled = true;

    let payload = {};
    const isSignUpForm = e.target.id === "a-form";

    if (isSignUpForm) {
        payload = {
            action: "signup",
            username: document.querySelector("#up-user").value,
            email: document.querySelector("#up-email").value,
            password: document.querySelector("#up-pass").value,
            otp: isVerifyingSignUp ? document.querySelector("#up-otp").value : null
        };
    } else {
        payload = {
            action: "login",
            email: document.querySelector("#in-email").value,
            password: document.querySelector("#in-pass").value
        };
    }

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data.result === "otp_sent") {
            isVerifyingSignUp = true;
            const tl = gsap.timeline();
            tl.to("#signup-fields", { opacity: 0, scale: 0.9, y: -20, duration: 0.4, ease: "power2.in", display: "none" })
              .set("#signup-otp-fields", { display: "block", opacity: 0, scale: 1.1 })
              .to("#signup-otp-fields", { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" });
            
            btn.innerText = "Verify Code";
            alert(data.message);
        } else if (data.result === "success") {
            if (payload.action === "signup") {
                alert("Account created successfully. You can now sign in.");
                isVerifyingSignUp = false;
                changeForm();
            } else {
                localStorage.setItem('admin_session', 'active');
                localStorage.setItem('admin_user', data.username);
                
                if (data.username.toLowerCase() === 'admin') {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            }
        } else if (data.result === "error") {
            if (data.message.includes("permission")) {
                alert("Server Error: Email service not authorized. Please contact the administrator to re-deploy the script.");
            } else {
                alert(data.message || "An error occurred. Please try again.");
            }
        }
    } catch (error) {
        console.error("Auth Error:", error);
        alert("Could not connect to the server. Please check your internet.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

const initParticles = () => {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 150) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animate);
    };
    animate();
};

const init = () => {
    // Set initial state
    gsap.set(aContainer, { autoAlpha: 0, x: 0 });
    bContainer.classList.add('is-active-form');

    document.querySelector("#a-form").addEventListener("submit", handleSubmit);
    document.querySelector("#b-form").addEventListener("submit", handleSubmit);

    for (var i = 0; i < switchBtn.length; i++) {
        switchBtn[i].addEventListener("click", changeForm);
    }
    initParticles();

    // Check URL for signup parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('form') === 'signup') {
        // Force immediate switch to signup state
        changeForm(true);
    }
};

window.addEventListener("load", init);