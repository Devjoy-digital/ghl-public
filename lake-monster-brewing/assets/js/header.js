/* Lake Monster Brewing - Header Component
   hosted at: https://devjoy-digital.github.io/ghl-public/lake-monster-brewing/assets/js/header.js
*/

(function() {
  'use strict';

  const HEADER_SELECTOR = '.header';
  const mountKey = '__header_mounted';

  // Prevent duplicate initialization
  if (window[mountKey]) return;
  window[mountKey] = true;

  // Initialize scroll state immediately
  const initImmediate = () => {
    const header = document.querySelector(HEADER_SELECTOR);
    if (!header) return;

    const scrolled = window.scrollY > 0;
    header.setAttribute('data-scrolled', scrolled ? 'true' : 'false');
    header.setAttribute('data-menu-open', 'false');
  };

  // Full initialization
  const init = () => {
    const header = document.querySelector(HEADER_SELECTOR);
    if (!header) return;

    // Scroll state management
    const updateScrollState = () => {
      const scrolled = window.scrollY > 0;
      const currentState = header.getAttribute('data-scrolled');
      const newState = scrolled ? 'true' : 'false';

      if (currentState !== newState) {
        header.setAttribute('data-scrolled', newState);
      }
    };

    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();

    // Mobile menu management
    const hamburger = header.querySelector('.header-hamburger');
    const overlay = header.querySelector('.header-overlay');
    const mobileLinks = header.querySelectorAll('.header-nav-mobile .header-nav-link');
    const desktopLinks = header.querySelectorAll('.header-nav-desktop .header-nav-link');
    const mq = window.matchMedia('(max-width: 768px)');

    const openMenu = () => header.setAttribute('data-menu-open', 'true');
    const closeMenu = () => header.setAttribute('data-menu-open', 'false');
    const toggleMenu = () => {
      const isOpen = header.getAttribute('data-menu-open') === 'true';
      isOpen ? closeMenu() : openMenu();
    };

    hamburger?.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mq.matches) {
          setTimeout(closeMenu, 300);
        }
      });
    });

    window.addEventListener('resize', () => {
      if (!mq.matches) closeMenu();
    });

    // Active link detection
    const allLinks = [...desktopLinks, ...mobileLinks];
    const sections = allLinks
      .map(link => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return null;
        const id = href.replace('#', '');
        const target = document.getElementById(id);
        if (!target) return null;
        return { link, target };
      })
      .filter(Boolean);

    const setActiveLink = (activeLink) => {
      header.querySelectorAll('.header-nav-item').forEach(item => {
        item.classList.remove('active');
      });

      allLinks.forEach(link => {
        if (link.getAttribute('href') === activeLink?.getAttribute('href')) {
          link.closest('.header-nav-item')?.classList.add('active');
        }
      });
    };

    if (sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          if (visible.length) {
            const active = sections.find(({ target }) => target === visible[0].target);
            if (active) setActiveLink(active.link);
          }
        },
        { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
      );

      sections.forEach(({ target }) => observer.observe(target));

      const initialHash = window.location.hash?.replace('#', '');
      if (initialHash) {
        const initial = sections.find(({ target }) => target.id === initialHash);
        if (initial) setActiveLink(initial.link);
      } else if (sections[0]) {
        setActiveLink(sections[0].link);
      }
    }
  };

  // Run initialization
  initImmediate();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
