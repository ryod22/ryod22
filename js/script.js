gsap.registerPlugin(ScrollTrigger);

// Custom Cursor
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';
document.body.appendChild(cursorDot);

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot follows instantly
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

function moveCursor() {
    // Smooth trail for the ring
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    requestAnimationFrame(moveCursor);
}
moveCursor();

// Hover Effects for Cursor
const hoverElements = 'a, .method, .btn-buy, button';
document.querySelectorAll(hoverElements).forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        const color = el.getAttribute('data-color');
        if (color) {
            cursor.style.borderColor = color;
            cursor.style.boxShadow = `0 0 20px ${color}`;
        }
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        cursor.style.borderColor = ''; // Revert to default
        cursor.style.boxShadow = ''; // Revert to default
    });
});

// Particle Engine update for mouse interaction
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.init();
    }
    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 2 + 1; // Falling speed (rain-like)
        this.opacity = Math.random() * 0.4 + 0.2;
    }
    update() {
        // Mouse Repulsion
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
            const force = (100 - distance) / 100;
            this.x += dx * force * 0.1;
            this.y += dy * force * 0.1;
        }

        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.init();
    }
    draw() {
        ctx.fillStyle = `rgba(255, 0, 127, ${this.opacity})`; // Pink
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles() {
    for (let i = 0; i < 60; i++) particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

initCanvas();
createParticles();
animate();

window.addEventListener('resize', initCanvas);

// Interaction for Falling Background Logos
window.addEventListener('mousemove', (e) => {
    const logos = document.querySelectorAll('.falling-logo');
    const mX = e.clientX;
    const mY = e.clientY;

    logos.forEach(logo => {
        const rect = logo.getBoundingClientRect();
        const lX = rect.left + rect.width / 2;
        const lY = rect.top + rect.height / 2;

        const dX = mX - lX;
        const dY = mY - lY;
        const dist = Math.sqrt(dX * dX + dY * dY);

        if (dist < 200) {
            const force = (200 - dist) / 200;
            const moveX = (dX / dist) * force * -50;
            const moveY = (dY / dist) * force * -50;
            logo.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
            logo.style.transform = `translate(0, 0)`;
        }
    });
});

// GSAP Reveal Animations
gsap.utils.toArray('.reveal').forEach(elem => {
    ScrollTrigger.create({
        trigger: elem,
        start: 'top 85%',
        onEnter: () => gsap.to(elem, { opacity: 1, y: 0, duration: 1, ease: 'power4.out' })
    });
});

// Payment Method Selection
const methods = document.querySelectorAll('.method');
const details = document.getElementById('details-area');
const info = {
    paypal: { msg: 'الدفع تلقائي عبر حساب باي بال', val: 'Email: mdlufey@gmail.com', show: true },
    card: { msg: 'الدفع مباشرة عبر البطاقة البنكية (Visa/MasterCard)', val: '', show: true },
    cashplus: { msg: 'تواصل معنا عبر الديسكورد للدفع عبر كاش بلوس', val: 'Discord: ryod_x66', show: false }
};

window.renderPaypal = function(id) {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';
    if (!info[id].show || !window.paypal) return;

    paypal.Buttons({
        fundingSource: id === 'paypal' ? paypal.FUNDING.PAYPAL : paypal.FUNDING.CARD,
        style: { 
            layout: 'vertical', 
            color: id === 'paypal' ? 'blue' : 'black', 
            shape: 'rect',
            label: id === 'paypal' ? 'paypal' : 'buynow'
        },
        createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { value: '25.00' } }] }),
        onApprove: (data, actions) => actions.order.capture().then(d => alert('Success'))
    }).render('#paypal-button-container');
}

// Initial render
setTimeout(() => renderPaypal('paypal'), 1000);

methods.forEach(m => {
    m.addEventListener('click', () => {
        methods.forEach(x => x.classList.remove('active'));
        m.classList.add('active');
        const id = m.getAttribute('data-id');
        
        gsap.to(details, { opacity: 0, duration: 0.2, onComplete: () => {
            details.querySelector('p').innerText = info[id].msg;
            const emailEl = details.querySelector('.email');
            emailEl.innerText = info[id].val;
            emailEl.style.display = info[id].val ? 'block' : 'none';
            renderPaypal(id);
            document.getElementById('paypal-button-container').style.display = info[id].show ? 'block' : 'none';
            gsap.to(details, { opacity: 1, duration: 0.3 });
        }});
    });
});
