const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const redirects = JSON.parse(fs.readFileSync(path.join(root, 'data/migration-redirects.json'), 'utf8'));
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'gfe-redirect-test-'));
let checked = 0;
try {
const build = spawnSync('python3', [path.join(root, 'scripts/build-redirects.py'), output], { encoding: 'utf8' });
assert.equal(build.status, 0, build.stderr);
for (const [oldPath, target] of Object.entries(redirects)) {
  const markup = fs.readFileSync(path.join(output, oldPath, 'index.html'), 'utf8');
  assert(!/<script\b[^>]*\bsrc=/.test(markup), `External script on ${oldPath}`);
  const script = markup.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert(script, `Missing inline redirect on ${oldPath}`);
  assert(markup.indexOf('<script>') < markup.indexOf('<meta name="viewport"'), `Late redirect on ${oldPath}`);
  assert(markup.includes(`content="0;url=https://www.gladiofreeeurope.com${target}"`), `Missing fallback on ${oldPath}`);
  for (const [search, hash] of [['', ''], ['?utm_source=legacy&episode=1', '#fn:1'], ['?q=%E2%80%94', '#player']]) {
    let actual;
    const canonical = 'https://www.gladiofreeeurope.com' + target;
    vm.runInNewContext(script, {
      window: { location: { search, hash, replace: (url) => { actual = url; } } },
    });
    assert.equal(actual, canonical + search + hash);
    checked++;
  }
}
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}
console.log(`Verified ${checked} inline redirects with query/fragment preservation and no extra script requests.`);
