/* ══════════════════════════════════════════════════════════
   CASA SAMAYA — ENHANCEMENT LAYER JS
   Adds scroll reveals, sticky booking bar, scroll indicator
   Works alongside main.js — no conflicts
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

    // ── 1. Scroll Reveal Observer ──
    const revealElements = document.querySelectorAll(
        '.reveal-on-scroll, .reveal-left, .reveal-right, .stagger-reveal'
    );

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        revealElements.forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    // ── 2. Auto-tag sections for reveal (if no manual classes set) ──
    // Only tags elements that don't already have reveal classes
    var sections = document.querySelectorAll(
        '.content-section h2, .content-section > .container > p, .trust-section h3'
    );
    sections.forEach(function (el) {
        if (!el.classList.contains('reveal-on-scroll') &&
            !el.closest('.reveal-on-scroll') &&
            !el.closest('.stagger-reveal')) {
            el.classList.add('reveal-on-scroll');
        }
    });

    // Tag split layouts for directional reveal
    document.querySelectorAll('.split-layout').forEach(function (split) {
        var img = split.querySelector('.split-image');
        var txt = split.querySelector('.split-text');
        if (img && !img.classList.contains('reveal-left') && !img.classList.contains('reveal-right')) {
            if (split.classList.contains('reverse')) {
                img.classList.add('reveal-left');
                if (txt) txt.classList.add('reveal-right');
            } else {
                img.classList.add('reveal-right');
                if (txt) txt.classList.add('reveal-left');
            }
        }
    });

    // Tag grids for stagger
    document.querySelectorAll('.experience-grid, .trust-grid').forEach(function (grid) {
        if (!grid.classList.contains('stagger-reveal')) {
            grid.classList.add('stagger-reveal');
        }
    });

    // Re-observe newly tagged elements
    var newReveals = document.querySelectorAll(
        '.reveal-on-scroll:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .stagger-reveal:not(.visible)'
    );
    if (newReveals.length > 0 && typeof IntersectionObserver !== 'undefined') {
        var obs2 = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        newReveals.forEach(function (el) { obs2.observe(el); });
    }

    // ── 3. Sticky Booking Bar (mobile) ──
    var bookingBar = document.getElementById('sticky-booking-bar');
    if (bookingBar) {
        var waBtn = null;
        var waBtnOriginalBottom = null;

        window.addEventListener('scroll', function () {
            var show = window.scrollY > window.innerHeight * 0.7;
            bookingBar.classList.toggle('visible', show);
            document.body.classList.toggle('bar-visible', show);

            // Find WA button (GTM injects it async, so keep trying)
            if (!waBtn) {
                waBtn = document.getElementById('wa-floating-btn');
                if (waBtn) {
                    waBtnOriginalBottom = window.getComputedStyle(waBtn).bottom;
                    waBtn.style.transition = 'bottom 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                }
            }
            if (waBtn) {
                waBtn.style.bottom = show ? '70px' : waBtnOriginalBottom;
            }
        }, { passive: true });
    }

    // ── 4. Add scroll indicator to home hero ──
    if (document.body.classList.contains('page-home')) {
        var hero = document.querySelector('.parallax-section');
        if (hero) {
            var indicator = document.createElement('div');
            indicator.className = 'scroll-indicator';
            hero.appendChild(indicator);
        }
    }

    // ── 5. Section dividers — add before h2 in centered sections ──
    document.querySelectorAll('.content-section.text-center > .container > h2').forEach(function (h2) {
        if (!h2.previousElementSibling || !h2.previousElementSibling.classList.contains('section-divider')) {
            var divider = document.createElement('div');
            divider.className = 'section-divider';
            h2.parentNode.insertBefore(divider, h2);
        }
    });
});
