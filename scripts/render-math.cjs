// Build-time rendering: the app ships SVG paths, without a MathJax runtime or CDN.
const fs = require('node:fs');
const path = require('node:path');
const { mathjax } = require('@mathjax/src/js/mathjax.js');
const { TeX } = require('@mathjax/src/js/input/tex.js');
const { SVG } = require('@mathjax/src/js/output/svg.js');
const { liteAdaptor } = require('@mathjax/src/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('@mathjax/src/js/handlers/html.js');
require('@mathjax/src/js/util/asyncLoad/node.js');
require('@mathjax/src/js/input/tex/ams/AmsConfiguration.js');
const root = path.resolve(__dirname, '..');
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const document = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams'], formatError(_jax, error) { throw error; } }),
  OutputJax: new SVG({ fontCache: 'none' }),
});

function collect(value, expressions) {
  if (Array.isArray(value)) return value.forEach(item => collect(item, expressions));
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string' && item.trim() && (key.endsWith('_latex') || key === 'latex')) expressions.add(item);
    else collect(item, expressions);
  }
}

async function run() {
  const expressions = new Set();
  for (const file of ['teoria', 'flashcards']) collect(JSON.parse(fs.readFileSync(path.join(root, 'data', file + '.json'), 'utf8')), expressions);
  const rendered = {};
  for (const latex of expressions) {
    const result = await document.convertPromise(latex, { display: true });
    const markup = adaptor.outerHTML(result);
    const match = markup.match(/<svg\b[\s\S]*?<\/svg>/);
    if (!match || markup.includes('data-mjx-error')) throw Error('Invalid equation: ' + latex);
    const svg = match[0].replace(/\sdata-[\w-]+="[^"]*"/g, '').replace(/currentColor/g, '#202C38');
    if (/<script|<foreignObject|\son\w+=|(?:href|src)="https?:/i.test(svg)) throw Error('Unexpected external content');
    const width = Number(svg.match(/\bwidth="([\d.]+)ex"/)?.[1]);
    const height = Number(svg.match(/\bheight="([\d.]+)ex"/)?.[1]);
    if (!(width > 0 && height > 0)) throw Error('Invalid equation dimensions');
    rendered[latex] = { svg, width: Math.ceil(width * 11), height: Math.ceil(height * 11) };
  }
  fs.writeFileSync(path.join(root, 'data', 'math-rendered.json'), JSON.stringify(rendered) + '\n');
  console.log(`Rendered ${expressions.size} expressions locally.`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
