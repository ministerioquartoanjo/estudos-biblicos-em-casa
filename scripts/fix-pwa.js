const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function findHtmlFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'scripts') continue;
    if (entry.isDirectory()) {
      results = results.concat(findHtmlFiles(full));
    } else if (entry.name === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

const PWA_HEAD_TAGS = [
  '    <meta name="theme-color" content="#667eea">',
  '    <link rel="manifest" href="/manifest.json">',
  '    <link rel="apple-touch-icon" href="/assets/icon-192x192.png">'
].join('\n');

const SW_SCRIPT = `    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => {
                        reg.addEventListener('updatefound', () => {
                            const newWorker = reg.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    showUpdateNotification();
                                }
                            });
                        });
                    });
            });
        }

        function showUpdateNotification() {
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-[100] flex justify-between items-center';
            notification.innerHTML = \`
                <span>Nova versão disponível!</span>
                <button onclick="window.location.reload()" class="bg-white text-blue-600 px-4 py-1 rounded-md font-bold text-sm">ATUALIZAR</button>
            \`;
            document.body.appendChild(notification);
        }
    </script>`;

const files = findHtmlFiles(ROOT);
let fixed = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  let changed = false;

  // 1. Add PWA head tags after <meta charset="UTF-8"> (only if not already present)
  if (!html.includes('rel="manifest"')) {
    html = html.replace(
      /(<meta charset="UTF-8">)/,
      `$1\n${PWA_HEAD_TAGS}`
    );
    changed = true;
  }

  // 2. Add SW registration script before </body> (only if not already present)
  if (!html.includes("serviceWorker.register('/service-worker.js')")) {
    html = html.replace('</body>', `${SW_SCRIPT}\n</body>`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
    fixed++;
    console.log('Injected PWA:', path.relative(ROOT, file));
  }
}

console.log(`\nDone. Injected PWA into ${fixed} files.`);
