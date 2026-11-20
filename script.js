/**
 * Flow & Pulse Hub - Interactive Scripts
 * Features:
 * - Theme Toggle (Dark & Light) with localStorage and prefers-color-scheme detection
 * - iOS & Android Segmented Control with animated gliding pill and ARIA keyboard support
 * - OS Auto-detection (preselecting iOS Safari or Android Chrome)
 * - Smooth scroll behavior for internal links
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Theme Management (Dark & Light)
  // -------------------------------------------------------------------------
  const THEME_STORAGE_KEY = 'flow_pulse_hub_theme';
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggle');
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to dark as requested (Dark Mode Blu Notte default)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#090F1E' : '#F5F5F7');
    }
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Passa alla modalità chiara' : 'Passa alla modalità scura');
    }
  }

  // Initialize theme
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    });
  }

  // Listen to OS theme changes if user hasn't explicitly set preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 2. Segmented Control (iOS / Android Tab switcher)
  // -------------------------------------------------------------------------
  const tabIos = document.getElementById('tab-ios');
  const tabAndroid = document.getElementById('tab-android');
  const panelIos = document.getElementById('panel-ios');
  const panelAndroid = document.getElementById('panel-android');
  const glider = document.querySelector('.segment-glider');
  const tabs = [tabIos, tabAndroid].filter(Boolean);

  function updateGlider(activeTab) {
    if (!glider || !activeTab) return;
    const tabRect = activeTab.getBoundingClientRect();
    const parentRect = activeTab.parentElement.getBoundingClientRect();
    const leftOffset = tabRect.left - parentRect.left;

    glider.style.width = `${tabRect.width}px`;
    glider.style.transform = `translateX(${leftOffset - 4}px)`; // accounting for 4px padding
  }

  function activateTab(tabToActivate) {
    if (!tabToActivate) return;
    const isIos = tabToActivate === tabIos;

    // Buttons
    tabIos.classList.toggle('active', isIos);
    tabIos.setAttribute('aria-selected', isIos ? 'true' : 'false');
    tabIos.setAttribute('tabindex', isIos ? '0' : '-1');

    tabAndroid.classList.toggle('active', !isIos);
    tabAndroid.setAttribute('aria-selected', !isIos ? 'true' : 'false');
    tabAndroid.setAttribute('tabindex', !isIos ? '0' : '-1');

    // Panels
    if (isIos) {
      panelIos.removeAttribute('hidden');
      panelIos.classList.add('active');
      panelAndroid.setAttribute('hidden', '');
      panelAndroid.classList.remove('active');
    } else {
      panelAndroid.removeAttribute('hidden');
      panelAndroid.classList.add('active');
      panelIos.setAttribute('hidden', '');
      panelIos.classList.remove('active');
    }

    updateGlider(tabToActivate);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateTab(tab);
    });

    // Keyboard navigation (ArrowLeft / ArrowRight)
    tab.addEventListener('keydown', function (e) {
      let targetTab = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetTab = tab === tabIos ? tabAndroid : tabIos;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetTab = tab === tabAndroid ? tabIos : tabAndroid;
      }

      if (targetTab) {
        e.preventDefault();
        targetTab.focus();
        activateTab(targetTab);
      }
    });
  });

  // OS Detection: detect if Android or iOS
  function detectOSAndSetTab() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    const isAndroid = /android/i.test(ua);
    if (isAndroid) {
      activateTab(tabAndroid);
    } else {
      activateTab(tabIos);
    }
  }

  // Setup glider position on load and resize
  window.addEventListener('load', function () {
    detectOSAndSetTab();
    window.requestAnimationFrame(function () {
      const activeTab = document.querySelector('.segment-btn.active') || tabIos;
      updateGlider(activeTab);
    });
  });

  window.addEventListener('resize', function () {
    const activeTab = document.querySelector('.segment-btn.active') || tabIos;
    updateGlider(activeTab);
  });

  // -------------------------------------------------------------------------
  // 3. Smooth scrolling for hash links
  // -------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          // Update URL hash without jump
          history.pushState(null, '', targetId);
        }
      }
    });
  });
})();
