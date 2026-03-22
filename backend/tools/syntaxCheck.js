const { exec } = require('child_process');
const glob = require('glob');

function checkFile(file) {
  return new Promise((resolve) => {
    exec(`node --check "${file}"`, (err, stdout, stderr) => {
      if (err) return resolve({ file, ok: false, error: stderr || stdout });
      return resolve({ file, ok: true });
    });
  });
}

async function run() {
  const files = glob.sync('**/*.js', { ignore: ['node_modules/**', 'frontend/**/node_modules/**', 'frontend/build/**', 'docker-compose.yml', 'Dockerfile*', 'backend/tools/**/node_modules/**'] });
  const results = [];
  for (const f of files) {
    const res = await checkFile(f);
    results.push(res);
  }

  const failures = results.filter(r => !r.ok);
  console.log(`Checked ${results.length} files. Failures: ${failures.length}`);
  failures.slice(0, 20).forEach(f => console.error(`FAIL: ${f.file}\n${f.error}`));
  if (failures.length > 0) process.exit(2);
}

run();
