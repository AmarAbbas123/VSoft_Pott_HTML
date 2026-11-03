/**
 * VisualSoft Global - Industry Service Spotlight Sub-tabs Controller
 * Provides 100% reliable interactivity for How We Help sections across all /industries/* routes.
 * Reverse-engineered from https://visualsoftglobal.com/industries/technology
 */
(function() {
  if (typeof window === 'undefined') return;

  function switchSpotlightTab(root, targetIndex, direction) {
    var tabs = Array.from(root.querySelectorAll('.IndustryServiceSpotlight_tabs__IaVvh button[role="tab"]'));
    var slides = Array.from(root.querySelectorAll('.IndustryServiceSpotlight_artSlide__2fLjH'));
    var copies = Array.from(root.querySelectorAll('.IndustryServiceSpotlight_copy__9QKbb'));
    var spotlight = root.querySelector('.IndustryServiceSpotlight_spotlight__daHFE');
    var panel = root.querySelector('[role="tabpanel"]');

    if (!tabs.length || targetIndex < 0 || targetIndex >= tabs.length) return;

    var activeIndex = tabs.findIndex(function(t) { return t.getAttribute('aria-selected') === 'true'; });
    if (activeIndex === -1) activeIndex = 0;
    if (targetIndex === activeIndex) return;

    var effDir = direction != null ? direction : (targetIndex > activeIndex ? 1 : -1);
    var prevIndex = activeIndex;

    // Set slide direction variable and paused rotation
    if (spotlight) {
      spotlight.style.setProperty('--slide-direction', String(effDir));
      spotlight.setAttribute('data-rotating', 'false');
    }

    // 1. Update Tabs
    tabs.forEach(function(tab, i) {
      var isTarget = i === targetIndex;
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      tab.tabIndex = isTarget ? 0 : -1;
      var prog = tab.querySelector('.IndustryServiceSpotlight_progress__Y4ZFx');
      if (prog) prog.remove();
    });

    // 2. Update Art Slides
    slides.forEach(function(slide, i) {
      if (i === targetIndex) {
        slide.setAttribute('data-state', 'active');
        slide.setAttribute('aria-hidden', 'false');
      } else if (i === prevIndex) {
        slide.setAttribute('data-state', 'outgoing');
        slide.setAttribute('aria-hidden', 'true');
      } else {
        slide.setAttribute('data-state', 'standby');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // 3. Update Copy Cards
    copies.forEach(function(copy, i) {
      if (i === targetIndex) {
        copy.setAttribute('data-state', 'active');
        copy.setAttribute('aria-hidden', 'false');
        copy.removeAttribute('inert');
      } else if (i === prevIndex) {
        copy.setAttribute('data-state', 'outgoing');
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('inert', '');
      } else {
        copy.setAttribute('data-state', 'standby');
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('inert', '');
      }
    });

    // 4. Update Tabpanel
    if (panel && tabs[targetIndex]) {
      panel.setAttribute('aria-labelledby', tabs[targetIndex].id);
    }
  }

  // Global delegation for Clicks
  document.addEventListener('click', function(e) {
    var target = e.target;
    if (!target) return;
    var tabBtn = target.closest ? target.closest('.IndustryServiceSpotlight_tabs__IaVvh button[role="tab"]') : null;
    if (!tabBtn) return;

    var root = tabBtn.closest('#how-we-help, .IndustryServiceSpotlight_root__ZrLLo');
    if (!root) return;

    var tabs = Array.from(root.querySelectorAll('.IndustryServiceSpotlight_tabs__IaVvh button[role="tab"]'));
    var idx = tabs.indexOf(tabBtn);
    if (idx !== -1) {
      e.preventDefault();
      root.__spotlightUserInteracted = true;
      switchSpotlightTab(root, idx);
      tabBtn.focus();
    }
  }, true);

  // Global delegation for Keyboard navigation
  document.addEventListener('keydown', function(e) {
    var target = e.target;
    if (!target) return;
    var tabBtn = target.closest ? target.closest('.IndustryServiceSpotlight_tabs__IaVvh button[role="tab"]') : null;
    if (!tabBtn) return;

    var root = tabBtn.closest('#how-we-help, .IndustryServiceSpotlight_root__ZrLLo');
    if (!root) return;

    var tabs = Array.from(root.querySelectorAll('.IndustryServiceSpotlight_tabs__IaVvh button[role="tab"]'));
    var idx = tabs.indexOf(tabBtn);
    if (idx === -1) return;

    var next = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (idx + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (idx + tabs.length - 1) % tabs.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    root.__spotlightUserInteracted = true;
    switchSpotlightTab(root, next, next > idx ? 1 : -1);
    if (tabs[next]) tabs[next].focus();
  }, true);

  // Auto-rotation observer
  function setupAutoRotation() {
    var sections = document.querySelectorAll('#how-we-help, .IndustryServiceSpotlight_root__ZrLLo');
    sections.forEach(function(root) {
      if (root.__spotlightObserverAttached) return;
      root.__spotlightObserverAttached = true;

      var observer = new IntersectionObserver(function(entries) {
        var isIntersecting = entries[0] && entries[0].isIntersecting;
        if (isIntersecting && !root.__spotlightTimer && !root.__spotlightUserInteracted) {
          root.__spotlightTimer = setInterval(function() {
            if (root.__spotlightUserInteracted || document.hidden) return;
            var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) return;
            var tabs = Array.from(root.querySelectorAll('.IndustryServiceSpotlight_tabs__IaVvh button[role="tab"]'));
            if (!tabs.length) return;
            var cur = tabs.findIndex(function(t) { return t.getAttribute('aria-selected') === 'true'; });
            if (cur === -1) cur = 0;
            switchSpotlightTab(root, (cur + 1) % tabs.length, 1);
          }, 6000);
        }
      }, { threshold: 0.2 });
      observer.observe(root);

      root.addEventListener('pointerenter', function() {
        root.__spotlightUserInteracted = true;
        if (root.__spotlightTimer) {
          clearInterval(root.__spotlightTimer);
          root.__spotlightTimer = null;
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoRotation);
  } else {
    setupAutoRotation();
  }
  window.addEventListener('popstate', setupAutoRotation);
  setInterval(setupAutoRotation, 2000);
})();

