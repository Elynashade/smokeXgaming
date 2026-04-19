// SECURITY CHECK: Redirect to auth if not logged in
if (localStorage.getItem('admin_session') !== 'active') {
    window.location.href = "auth.html";
}

// Initialize User Data
const username = localStorage.getItem('admin_user') || 'CHAMPION';
document.getElementById('display-username').innerText = username;
document.getElementById('welcome-name').innerText = username;

// Set Initials
let initials = 'XP';
if (username) {
    const nameParts = username.trim().split(/\s+/);
    initials = nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : username.substring(0, 2).toUpperCase();
}
document.getElementById('user-initials').innerText = initials;

// Real-time Clock & Date
function updateTime() {
    const now = new Date();
    
    // Time
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
    document.getElementById('time').innerText = timeStr;
    
    // Greeting
    const hours = now.getHours();
    let greeting = "GOOD EVENING";
    if (hours < 12) greeting = "GOOD MORNING";
    else if (hours < 17) greeting = "GOOD AFTERNOON";
    document.getElementById('greeting').innerText = greeting;
    
    // Date
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('date').innerText = now.toLocaleDateString('en-US', options).toUpperCase();
}

setInterval(updateTime, 1000);
updateTime();

// Logout Logic
document.querySelector('.logout-btn').addEventListener('click', () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    window.location.href = "auth.html";
});

// Simple Toggle Interactivity
document.querySelectorAll('.menu li').forEach(li => {
    li.addEventListener('click', () => {
        document.querySelector('.menu li.active').classList.remove('active');
        li.classList.add('active');
    });
});