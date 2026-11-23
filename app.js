// ===== Data Fitur =====
const featuresData = [
    {
        icon: '⚡',
        title: 'Performa Cepat',
        description: 'Dioptimasi untuk kecepatan tinggi dengan loading time minimal.'
    },
    {
        icon: '🎨',
        title: 'Desain Modern',
        description: 'Tampilan elegan dengan UI/UX yang intuitif dan responsif.'
    },
    {
        icon: '🔒',
        title: 'Keamanan Terjamin',
        description: 'Perlindungan data pengguna dengan enkripsi standar industri.'
    },
    {
        icon: '📱',
        title: 'Responsif',
        description: 'Tampilan sempurna di semua perangkat, dari desktop hingga mobile.'
    },
    {
        icon: '🛠️',
        title: 'Mudah Dikustomisasi',
        description: 'Fleksibel dan mudah disesuaikan sesuai kebutuhan Anda.'
    },
    {
        icon: '🚀',
        title: 'Siap Produksi',
        description: 'Arsitektur solid yang siap untuk deployment skala besar.'
    }
];

// ===== Render Feature Cards =====
function renderFeatures() {
    const grid = document.getElementById('features-grid');
    if (!grid) return;

    grid.innerHTML = featuresData.map((feature, index) => `
        <div class="feature-card" style="transition-delay: ${index * 100}ms">
            <div class="feature-icon">${feature.icon}</div>
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
        </div>
    `).join('');
}

// ===== Scroll Animation (Intersection Observer) =====
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
}

// ===== Mobile Navigation Toggle =====
function initMobileNav() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        toggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });

    // Tutup menu saat link diklik
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            toggle.textContent = '☰';
        });
    });
}

// ===== Active Nav on Scroll =====
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// ===== Toast Notification =====
function showToast(message) {
    // Hapus toast lama jika ada
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== Contact Form Handler =====
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nama = document.getElementById('nama').value.trim();
        const email = document.getElementById('email').value.trim();
        const pesan = document.getElementById('pesan').value.trim();

        if (!nama || !email || !pesan) {
            showToast('⚠️ Mohon lengkapi semua field!');
            return;
        }

        console.log('Form submitted:', { nama, email, pesan });
        showToast(`✅ Terima kasih, ${nama}! Pesan Anda telah terkirim.`);
        form.reset();
    });
}

// ===== CTA Button =====
function initCTA() {
    const ctaBtn = document.getElementById('cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            document.getElementById('fitur').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ===== Header Scroll Effect =====
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.padding = '16px 0';
            header.style.boxShadow = 'none';
        }
    });
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    renderFeatures();
    initScrollAnimation();
    initMobileNav();
    initActiveNav();
    initContactForm();
    initCTA();
    initHeaderScroll();

    console.log('🚀 WebApp Assas loaded successfully!');
});
