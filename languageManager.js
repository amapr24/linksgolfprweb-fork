/* =========================================================
   Boricua Golf Club · Language Manager
   JSON-driven bilingual (ES/EN) with localStorage persistence
   ========================================================= */
(function () {
  const STORAGE_KEY = 'bgc.lang';
  const DEFAULT_LANG = 'es';
  const SUPPORTED = ['es', 'en'];

  // Preload translations. Using fetch keeps one source file.
  let translations = {};
  let currentLang = DEFAULT_LANG;
  const readyListeners = [];
  let ready = false;

  function getSavedLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (_) {}
    // fallback: browser hint, but default to ES
    const nav = (navigator.language || '').slice(0, 2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : DEFAULT_LANG;
  }

  function t(key) {
    const entry = translations[key];
    if (!entry) return null;
    return entry[currentLang] != null ? entry[currentLang] : entry[DEFAULT_LANG];
  }

  function applyTranslations(root) {
    root = root || document;

    // Text / innerHTML nodes
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val != null) el.innerHTML = val;
    });

    // Attribute nodes: data-i18n-attr="key|attr,key2|attr2"
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(pair => {
        const [key, attr] = pair.trim().split('|').map(s => s && s.trim());
        if (!key || !attr) return;
        const val = t(key);
        if (val != null) el.setAttribute(attr, stripHTML(val));
      });
    });

    // <title> element
    const titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) {
      const tv = t(titleKey);
      if (tv != null) document.title = stripHTML(tv);
    }

    // <html lang="">
    document.documentElement.setAttribute('lang', currentLang);

    // Update toggle labels
    root.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      const other = currentLang === 'es' ? 'en' : 'es';
      const label = (translations['meta.lang.label'] && translations['meta.lang.label'][other]) || other.toUpperCase();
      const aria = (translations['meta.lang.aria'] && translations['meta.lang.aria'][currentLang]) || '';
      btn.textContent = label;
      if (aria) btn.setAttribute('aria-label', aria);
      btn.dataset.current = currentLang;
    });
  }

  function stripHTML(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || '';
  }

  function setLang(lang, persist) {
    if (!SUPPORTED.includes(lang)) return;
    currentLang = lang;
    if (persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    }
    if (ready) {
      applyTranslations();
      document.dispatchEvent(new CustomEvent('bgc:langchange', { detail: { lang } }));
    }
  }

  function toggle() {
    setLang(currentLang === 'es' ? 'en' : 'es');
  }

  function onReady(fn) {
    if (ready) fn();
    else readyListeners.push(fn);
  }

  async function init() {
    currentLang = getSavedLang();
    try {
      const res = await fetch('translations.json', { cache: 'no-cache' });
      translations = await res.json();
    } catch (err) {
      console.error('[i18n] Failed to load translations.json', err);
      translations = {};
    }
    ready = true;
    applyTranslations();
    document.dispatchEvent(new CustomEvent('bgc:ready', { detail: { lang: currentLang } }));
    readyListeners.forEach(fn => { try { fn(); } catch (_) {} });
    readyListeners.length = 0;

    // Wire up any toggle buttons
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        toggle();
      });
    });
  }

  // Expose a tiny public API
  window.BGC_I18N = {
    t,
    get lang() { return currentLang; },
    setLang,
    toggle,
    onReady,
    apply: applyTranslations
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
