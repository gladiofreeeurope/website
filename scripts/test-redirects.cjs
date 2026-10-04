const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const redirects = JSON.parse(fs.readFileSync(path.join(root, 'data/migration-redirects.json'), 'utf8'));
const script = fs.readFileSync(path.join(root, 'static/migration-redirect.js'), 'utf8');
let checked = 0;
for (const target of Object.values(redirects)) {
  for (const [search, hash] of [['', ''], ['?utm_source=legacy&episode=1', '#fn:1'], ['?q=%E2%80%94', '#player']]) {
    let actual;
    const canonical = 'https://www.gladiofreeeurope.com' + target;
    vm.runInNewContext(script, {
      URL,
      document: { querySelector: () => ({ href: canonical }) },
      window: { location: { search, hash, replace: (url) => { actual = url; } } },
    });
    assert.equal(actual, canonical + search + hash);
    checked++;
  }
}
vm.runInNewContext(script, { document: { querySelector: () => null } });
console.log(`Verified ${checked} redirects with query and fragment preservation.`);
