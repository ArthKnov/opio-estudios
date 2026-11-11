// Pos-processa o build web para o GitHub Pages:
//  - injeta idioma, titulo, descricao, cor do tema e fundo preto no index.html
//  - 404.html = index.html (fallback do SPA)
//  - .nojekyll (o Pages nao ignora pastas que comecam com "_" como _expo)
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const indexPath = path.join(dist, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html nao encontrado. Rode "expo export -p web" antes.');
  process.exit(1);
}

const TITLE = 'ØPIO ESTÚDIOS | Produção musical, gravação, mix e master';
const DESCRIPTION =
  'ØPIO ESTÚDIOS: direção musical, pré-produção, gravação, mix & master e lançamento. Conheça as salas A e B e agende uma visita.';

const head = `
    <meta name="description" content="${DESCRIPTION}" />
    <meta name="theme-color" content="#050707" />
    <meta name="color-scheme" content="dark" />
    <meta property="og:title" content="ØPIO ESTÚDIOS" />
    <meta property="og:description" content="Produção musical do primeiro acorde ao lançamento." />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <style>html,body{background-color:#050707;color:#f2f2f0}::selection{background:#ff2a2a;color:#050707}</style>`;

let html = fs.readFileSync(indexPath, 'utf8');
html = html
  .replace('<html lang="en">', '<html lang="pt-BR" style="background-color:#050707">')
  .replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
  .replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />')
  .replace('</head>', `${head}\n  </head>`);

fs.writeFileSync(indexPath, html);
fs.writeFileSync(path.join(dist, '404.html'), html);
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('postbuild-web: index.html ajustado, 404.html e .nojekyll criados em dist/');
