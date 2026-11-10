(function () {
  'use strict';

  var STORAGE_KEY = 'fox-theme';
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var labels = { auto: 'авто', light: 'светлая', dark: 'тёмная' };
  var icons = {
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4v16a8 8 0 0 0 0-16Z" fill="currentColor" stroke="none"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/></svg>'
  };

  function readMode() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      if (value === 'auto' || value === 'light' || value === 'dark') return value;
    } catch (e) {}
    return 'auto';
  }

  function effective(mode) {
    if (mode === 'auto') return media && media.matches ? 'dark' : 'light';
    return mode;
  }

  function updateMeta(theme) {
    var meta = document.getElementById('theme-color');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#141613' : '#f3f1ec');
  }

  function updateButtons(mode, theme) {
    var label = labels[mode] + (mode === 'auto' ? ' · сейчас ' + labels[theme] : '');
    var nodes = document.querySelectorAll('.theme-btn');
    for (var i = 0; i < nodes.length; i++) {
      var btn = nodes[i];
      btn.innerHTML = icons[mode] + '<span class="theme-btn-label">' + labels[mode] + '</span>';
      btn.setAttribute('aria-label', 'Тема: ' + label + '. Переключить');
      btn.title = 'Тема: ' + label;
      btn.setAttribute('data-mode', mode);
    }
  }

  function apply(mode, persist) {
    var theme = effective(mode);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme-mode', mode);
    if (persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    }
    updateMeta(theme);
    updateButtons(mode, theme);
  }

  function getMode() {
    return document.documentElement.getAttribute('data-theme-mode') || 'auto';
  }

  window.cycleTheme = function () {
    var order = ['auto', 'light', 'dark'];
    apply(order[(order.indexOf(getMode()) + 1) % order.length], true);
  };

  window.updateThemeButtons = function () {
    apply(getMode(), false);
  };

  window.getEffectiveTheme = function () {
    return effective(getMode());
  };

  apply(readMode(), false);

  if (media) {
    var onChange = function () {
      if (getMode() === 'auto') apply('auto', false);
    };
    if (media.addEventListener) media.addEventListener('change', onChange);
    else if (media.addListener) media.addListener(onChange);
  }

  // Delegated click: works for buttons rendered later (header, modals).
  document.addEventListener('click', function (event) {
    var btn = event.target && event.target.closest ? event.target.closest('.theme-btn') : null;
    if (btn) {
      event.preventDefault();
      window.cycleTheme();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.updateThemeButtons);
  } else {
    window.updateThemeButtons();
  }
})();
