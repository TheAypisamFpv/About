window.onload = function () {
    // Only the page's own content: browser extensions (e.g. Monica) inject their own root as a child of body.
    // A transform left by .animate would become the containing block of their position:fixed overlays,
    // pushing them below the footer and making the page taller.
    const elements = document.querySelectorAll('body > .full');
    elements.forEach(element => {
        element.classList.add('animate');
        // Remove the class once played so no transform lingers (same as the Photography Portfolio)
        element.addEventListener('animationend', () => {
            element.classList.remove('animate');
        }, { once: true });
    });
};


let lastScrollTop = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 50) {
        header.classList.add('header-hide');
    } else if (scrollTop < lastScrollTop) {
        header.classList.remove('header-hide');
    }
    lastScrollTop = scrollTop;
});

// Theme: dark by default, the visitor's choice is remembered (localStorage 'theme', applied before first paint
// by the inline script at the top of <body>). Icons follow the theme actually in use.
// This script is loaded async and can run before the header is parsed, so the setup waits for the DOM.
const THEME_KEY = 'theme';
function initTheme() {
    const themeSwitcher = document.getElementById('theme-switcher');
    const moonIcon = document.querySelector('#moon-icon');
    const sunIcon = document.querySelector('#sun-icon');
    const body = document.body;

    const dark = body.classList.contains('dark-theme');
    moonIcon.classList.toggle('shown', dark);
    moonIcon.classList.toggle('hidden', !dark);
    sunIcon.classList.toggle('shown', !dark);
    sunIcon.classList.toggle('hidden', dark);

    themeSwitcher.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            moonIcon.classList.remove('shown');
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
            sunIcon.classList.add('shown');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            moonIcon.classList.remove('hidden');
            moonIcon.classList.add('shown');
            sunIcon.classList.remove('shown');
            sunIcon.classList.add('hidden');
        }
        try { localStorage.setItem(THEME_KEY, body.classList.contains('dark-theme') ? 'dark' : 'light'); } catch (e) {}
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

// Touch screens have no hover: the element most visible on screen gets the
// is-current class, styled like the hover state (style-common.css).
function highlightMostVisible(selector) {
    if (!window.matchMedia('(hover: none)').matches) return;
    let current = null;
    let frame = 0;
    const update = () => {
        frame = 0;
        let best = null;
        let bestVisible = 0;
        document.querySelectorAll(selector).forEach(el => {
            const r = el.getBoundingClientRect();
            const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
            if (visible > bestVisible) { bestVisible = visible; best = el; }
        });
        if (best !== current) {
            if (current) current.classList.remove('is-current');
            if (best) best.classList.add('is-current');
            current = best;
        }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => highlightMostVisible('.project'));
} else {
    highlightMostVisible('.project');
}

document.addEventListener('DOMContentLoaded', function() {
    const currentYear = new Date().getFullYear();
    const footerCredits = document.querySelector('.footer_credits p');
    footerCredits.textContent = `© ${currentYear} The Aypisam FPV`;
});

// iOS Safari only applies :active (press styles) on tap when the page listens to touches
document.addEventListener('touchstart', () => {}, { passive: true });
