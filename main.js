// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    const scrollTop = document.getElementById('scrollTop');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        scrollTop.classList.add('visible');
    } else {
        header.classList.remove('scrolled');
        scrollTop.classList.remove('visible');
    }
});

// Fade-in on scroll
const fadeElements = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });
fadeElements.forEach(el => observer.observe(el));

// Counter animation
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.dataset.target);
            const increment = target / 60;
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 30);
            counterObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// ==== Form submission → Google Sheet + Zalo ====
// Dán URL Web App của Google Apps Script vào đây sau khi deploy (xem file HUONG_DAN_FORM.md)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID_HERE/exec';

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const statusEl = contactForm.querySelector('.form-status');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    const setStatus = (msg, color) => {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.style.color = color || 'inherit';
    };

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        formData.append('source', this.dataset.source || 'Không xác định');
        formData.append('pageUrl', window.location.href);
        formData.append('submittedAt', new Date().toISOString());

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:8px"></i> Đang gửi...';
        }
        setStatus('', '');

        try {
            if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_YOUR_DEPLOYMENT_ID_HERE')) {
                throw new Error('Chưa cấu hình APPS_SCRIPT_URL trong main.js');
            }
            // Dùng no-cors để tránh lỗi preflight CORS với Apps Script
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });
            setStatus('✓ Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.', '#4A6741');
            this.reset();
        } catch (err) {
            console.error('Form submit error:', err);
            setStatus('✗ Gửi không thành công. Vui lòng gọi 0975 873 866 để được tư vấn trực tiếp.', '#b94a48');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
            }
        }
    });
}

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        document.getElementById('navList').classList.toggle('open');
    });
}

// Smooth scroll for anchor links (only on same page)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('navList').classList.remove('open');
        }
    });
});

// Floating contact toggle
const floatingBtn = document.querySelector('.floating-btn');
if (floatingBtn) {
    floatingBtn.addEventListener('click', function() {
        this.parentElement.classList.toggle('active');
    });
}

// Scroll to top
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
