// Compiles/tests only this module in a disposable tree; no shared package/config edits.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const deps = process.argv[2] || path.join(root, 'node_modules');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tao-business-insights-'));
try {
  for (const rel of ['src/lib/business-insights', 'src/components/admin/business-insights']) {
    fs.cpSync(path.join(root, rel), path.join(temp, rel), { recursive: true });
  }
  fs.symlinkSync(path.resolve(deps), path.join(temp, 'node_modules'), 'dir');
  const files = ['src/lib/business-insights/index.ts', 'src/components/admin/business-insights/BusinessInsightsView.tsx'];
  const compile = spawnSync(process.execPath, [path.join(deps, 'typescript/bin/tsc'), '--strict', '--skipLibCheck',
    '--module', 'commonjs', '--target', 'ES2020', '--moduleResolution', 'node', '--esModuleInterop', '--jsx', 'react',
    '--outDir', path.join(temp, 'out'), ...files], { cwd: temp, stdio: 'inherit' });
  if (compile.status !== 0) process.exitCode = compile.status || 1;
  else {
    const tests = spawnSync(process.execPath, ['--test', path.join(__dirname, 'domain.test.cjs')], {
      cwd: root, stdio: 'inherit', env: { ...process.env, BUSINESS_INSIGHTS_BUILD: path.join(temp, 'out'), BUSINESS_INSIGHTS_DEPS: path.resolve(deps) },
    });
    process.exitCode = tests.status || (tests.signal ? 1 : 0);
  }
} finally {
  // Only this runner's newly-created temp tree, never user data/dependency targets.
  fs.rmSync(temp, { recursive: true, force: true });
}
