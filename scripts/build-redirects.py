"""Build redirects: python3 scripts/build-redirects.py OUTPUT_DIRECTORY.

OUTPUT_DIRECTORY may be the gladiofreeeurope/gladiofreeeurope.github.io checkout.
Existing images and other non-HTML assets remain available for old direct links.
"""
import html
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
DESTINATION = "https://www.gladiofreeeurope.com"

def build(output):
    redirects = json.loads((ROOT / "data/migration-redirects.json").read_text())
    output.mkdir(parents=True, exist_ok=True)
    for old_path, new_path in redirects.items():
        if not old_path.startswith("/") or not old_path.endswith("/") or ".." in old_path:
            raise ValueError(f"Invalid source path: {old_path}")
        if not new_path.startswith("/") or new_path.startswith("//"):
            raise ValueError(f"Invalid destination path: {new_path}")
        canonical = html.escape(DESTINATION + new_path, quote=True)
        script_target = json.dumps(DESTINATION + new_path).replace("<", "\\u003c")
        page = output / old_path.lstrip("/") / "index.html"
        page.parent.mkdir(parents=True, exist_ok=True)
        page.write_text(f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script>window.location.replace({script_target} + window.location.search + window.location.hash);</script>
  <meta http-equiv="refresh" content="0;url={canonical}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-site-verification" content="J3pj4z86dEKJNR2MFc3F_HvZg737o34nnm9J0tdq8nM">
  <title>Gladio Free Europe — page moved</title>
  <link rel="canonical" href="{canonical}">
  <meta property="og:url" content="{canonical}">
</head>
<body><p>This page has moved to <a href="{canonical}">Gladio Free Europe</a>.</p></body>
</html>
''')
    for name in ("migration-redirect.js", ".nojekyll"):
        (output / name).write_bytes((ROOT / "static" / name).read_bytes())
    (output / "404.html").write_text('''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found · Gladio Free Europe</title></head>
<body><h1>Page not found</h1><p>Visit <a href="https://www.gladiofreeeurope.com/episodes/">the episode archive</a> or <a href="https://www.gladiofreeeurope.com/">Gladio Free Europe</a>.</p></body></html>
''')
    print(f"Built {len(redirects)} redirects in {output}.")

if __name__ == "__main__":
    build(Path(sys.argv[1]))
