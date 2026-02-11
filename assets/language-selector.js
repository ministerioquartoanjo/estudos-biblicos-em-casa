const SELECTOR_ATTR = '[data-language-selector]';
const BASE_CLASSES = 'p-2 rounded-full border shadow-lg backdrop-blur-md transition-all inline-flex items-center justify-center';
const ACTIVE_CLASSES = 'bg-white/40 border-white/60';
const INACTIVE_CLASSES = 'bg-white/20 border-white/50 hover:bg-white/30';

let languageDataPromise = null;

function loadLanguageData() {
  if (!languageDataPromise) {
    languageDataPromise = fetch('/assets/languages.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load languages.json');
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Language selector: unable to load configuration.', error);
        return null;
      });
  }

  return languageDataPromise;
}

function buildLanguageLink(language, href, isActive) {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.className = [BASE_CLASSES, isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES].join(' ');
  anchor.title = language.label;

  const flag = document.createElement('img');
  flag.src = language.flag;
  flag.alt = language.nativeLabel || language.label;
  flag.className = 'w-5 h-auto';
  anchor.append(flag);

  const srOnly = document.createElement('span');
  srOnly.className = 'sr-only';
  srOnly.textContent = language.nativeLabel || language.label;
  anchor.append(srOnly);

  return anchor;
}

async function hydrateLanguageSelector(container) {
  const pageKey = container.dataset.pageKey;
  const currentLang = container.dataset.currentLang || document.documentElement.lang;

  if (!pageKey) {
    console.warn('Language selector: missing data-page-key attribute.');
    return;
  }

  const data = await loadLanguageData();
  if (!data) return;

  const page = data.pages.find((entry) => entry.key === pageKey);
  if (!page) {
    console.warn(`Language selector: no page entry found for key "${pageKey}".`);
    return;
  }

  container.innerHTML = '';
  data.languages.forEach((language) => {
    const href = page.paths[language.code];
    if (!href) return;

    const link = buildLanguageLink(language, href, language.code === currentLang);
    container.append(link);
  });
}

async function initLanguageSelectors() {
  const containers = document.querySelectorAll(SELECTOR_ATTR);
  if (!containers.length) return;

  await Promise.all(Array.from(containers).map(hydrateLanguageSelector));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageSelectors);
} else {
  initLanguageSelectors();
}
