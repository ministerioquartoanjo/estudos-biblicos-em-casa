const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LANG_JSON = path.join(ROOT, 'assets', 'languages.json');

if (!fs.existsSync(LANG_JSON)) {
  console.error('languages.json não encontrado em assets/.');
  process.exit(1);
}

const languageData = JSON.parse(fs.readFileSync(LANG_JSON, 'utf-8'));
const routeIndex = new Map();
const COMMENT_TOKENS = [
  'language selector',
  'selector de idioma',
  'seleccionador de idioma',
  'seletor de idiomas',
  'selecionador de idioma'
];

function normalizeRoute(route) {
  if (!route) return null;
  let normalized = route.trim();
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  if (!normalized.endsWith('/') && !normalized.endsWith('.html')) {
    normalized = `${normalized}/`;
  }
  return normalized.replace(/\/+/g, '/');
}

languageData.pages.forEach((page) => {
  Object.entries(page.paths).forEach(([lang, route]) => {
    const normalized = normalizeRoute(route);
    if (!normalized) return;
    routeIndex.set(normalized, { pageKey: page.key, lang });
  });
});

function routeFromFile(filePath) {
  const relative = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('index.html')) {
    const dir = relative.slice(0, -'index.html'.length);
    return normalizeRoute(`/${dir}`);
  }
  return normalizeRoute(`/${relative}`);
}

function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectHtmlFiles(fullPath);
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      return [fullPath];
    }
    return [];
  });
}

function ensureScriptTag(content) {
  if (content.includes('language-selector.js')) return content;
  const scriptTag = '\n    <script type="module" src="/assets/language-selector.js"></script>'; 
  const bodyCloseIndex = content.lastIndexOf('</body>');
  if (bodyCloseIndex === -1) return content;
  return `${content.slice(0, bodyCloseIndex)}${scriptTag}\n${content.slice(bodyCloseIndex)}`;
}

function removeInlineImport(content) {
  const pattern = /\s*import\s+['\"]\/assets\/language-selector\.js['\"];?\s*/g;
  return content.replace(pattern, '\n');
}

function buildPlaceholder(meta) {
  return `    <!-- Language Selector -->\n    <div\n        class="fixed top-4 right-4 z-50 flex gap-2"\n        data-language-selector\n        data-page-key="${meta.pageKey}"\n        data-current-lang="${meta.lang}"\n        aria-label="Language selector"\n     ></div>`;
}

function findSelectorComment(content) {
  const lower = content.toLowerCase();
  for (const token of COMMENT_TOKENS) {
    const idx = lower.indexOf(token);
    if (idx === -1) continue;
    const start = content.lastIndexOf('<!--', idx);
    const end = content.indexOf('-->', idx);
    if (start !== -1 && end !== -1) {
      return { start, end: end + 3 };
    }
  }
  return null;
}

function replaceSelector(content, placeholder) {
  const marker = findSelectorComment(content);
  if (!marker) return { content, changed: false };

  const existingBlockStart = content.indexOf('<div', marker.end);
  if (existingBlockStart === -1) return { content, changed: false };

  const existingBlockEnd = content.indexOf('</div>', existingBlockStart);
  if (existingBlockEnd === -1) return { content, changed: false };

  const block = content.slice(marker.start, existingBlockEnd + 6);
  if (block.includes('data-language-selector')) {
    return { content, changed: false };
  }

  const newContent = `${content.slice(0, marker.start)}${placeholder}${content.slice(existingBlockEnd + 6)}`;
  return { content: newContent, changed: true };
}

const files = collectHtmlFiles(ROOT);
let updatedCount = 0;

files.forEach((file) => {
  const route = routeFromFile(file);
  const meta = routeIndex.get(route);
  if (!meta) return;

  let content = fs.readFileSync(file, 'utf-8');
  const placeholder = buildPlaceholder(meta);
  const { content: replacedContent, changed } = replaceSelector(content, placeholder);
  let modified = changed;
  let cleanedContent = removeInlineImport(replacedContent);

  const withScript = ensureScriptTag(cleanedContent);
  if (withScript !== cleanedContent) {
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, withScript, 'utf-8');
    updatedCount += 1;
    console.log(`Atualizado: ${path.relative(ROOT, file)}`);
  }
});

console.log(`\nTotal de arquivos atualizados: ${updatedCount}`);
