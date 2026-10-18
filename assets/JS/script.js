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

window.addEventListener('scroll', function () {
    // Looked up on each scroll: this script is loaded async and can run before the header is parsed.
    const header = document.getElementById('header');
    if (!header) return;
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

// Gold frame layer of the project cards (style-common.css, 11b): first child, so it sits between the grey frame and
// the fill. Only its opacity animates, on the compositor.
function addCutHighlight(el) {
    if (el.querySelector(':scope > .ui-cut-hi')) return;
    const frame = document.createElement('span');
    frame.className = 'ui-cut-hi';
    frame.setAttribute('aria-hidden', 'true');
    frame.appendChild(document.createElement('span'));
    el.prepend(frame);
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('.project').forEach(addCutHighlight));
} else {
    document.querySelectorAll('.project').forEach(addCutHighlight);
}

// Touch screens have no hover: the element nearest the centre of the screen gets the
// is-current class, styled like the hover state (style-common.css).
function highlightNearestCentre(selector) {
    if (!window.matchMedia('(hover: none)').matches) return;
    let current = null;
    let frame = 0;
    const update = () => {
        frame = 0;
        let best = null;
        let bestDistance = Infinity;
        // Distance from the horizontal centre line of the screen to the element (0 when the line crosses it),
        // so even a short element gets its turn while it passes the middle of the screen.
        const centre = window.innerHeight / 2;
        document.querySelectorAll(selector).forEach(el => {
            const r = el.getBoundingClientRect();
            const distance = r.top > centre ? r.top - centre : r.bottom < centre ? centre - r.bottom : 0;
            if (distance < bestDistance) { bestDistance = distance; best = el; }
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
    document.addEventListener('DOMContentLoaded', () => highlightNearestCentre('.project'));
} else {
    highlightNearestCentre('.project');
}

document.addEventListener('DOMContentLoaded', function() {
    const currentYear = new Date().getFullYear();
    const footerCredits = document.querySelector('.footer_credits p');
    footerCredits.textContent = `© ${currentYear} The Aypisam FPV`;
});

// iOS Safari only applies :active (press styles) on tap when the page listens to touches
document.addEventListener('touchstart', () => {}, { passive: true });

// Touch screens: a tap is much shorter than the underline animation, so the tapped link keeps the is-tapped class
// long enough for its line to be drawn (style-common.css, 10a), then lets it fade out.
if (window.matchMedia('(hover: none)').matches) {
    document.addEventListener('click', (e) => {
        const link = e.target.closest && e.target.closest('a:not(.project)');
        if (!link) return;
        link.classList.add('is-tapped');
        clearTimeout(link.tapTimer);
        link.tapTimer = setTimeout(() => link.classList.remove('is-tapped'), 700);
    }, true);
}
