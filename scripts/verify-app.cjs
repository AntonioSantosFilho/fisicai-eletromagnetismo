// Verifica cada código de saída e mantém evidências reproduzíveis, sem tocar dados do aluno.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'auditoria'), { recursive: true });
const checks = [];
function run(name, args, output) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (output) fs.writeFileSync(path.join(root, 'auditoria', output), (result.stdout || '') + (result.stderr || ''));
  checks.push({ name, passed: result.status === 0, exitCode: result.status });
  if (result.error || result.status !== 0) {
    console.error(result.error || result.stdout + result.stderr);
    throw new Error(`Verificação falhou: ${name}`);
  }
  console.log(`${name}: aprovado`);
}
try {
  run('TypeScript', ['node_modules/typescript/bin/tsc', '--noEmit'], 'tipagem.log');
  run('Testes automatizados', ['--test', '--test-reporter=tap', ...fs.readdirSync(path.join(root, 'tests')).filter(file => file.endsWith('.test.cjs')).sort().map(file => `tests/${file}`)], 'testes.tap');
  run('Diagnóstico do app', ['scripts/audit-app.cjs'], 'diagnostico.log');
  run('Exportação web e Android', ['node_modules/expo/bin/cli', 'export', '--platform', 'web', '--platform', 'android', '--output-dir', 'dist'], 'exportacao.log');
  run('Relatório com evidências', ['scripts/report-audit.cjs'], 'relatorio.log');
} catch { process.exitCode = 1; }
finally { fs.writeFileSync(path.join(root, 'auditoria/verificacao-tecnica.json'), JSON.stringify({ date: new Date().toISOString(), checks, limits: ['Sem aparelho físico.', 'Sem requisição real ao Google.', 'Sem publicação ou execução remota de CI.'] }, null, 2) + '\n'); }
