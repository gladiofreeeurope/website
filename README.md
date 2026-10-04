# Gladio Free Europe

This is the Hugo source for the former GitHub Pages website.

The current site, `https://www.gladiofreeeurope.com`, is built from `ostsam/gfe`.
The old site is served from **master, repository root** in
`gladiofreeeurope/gladiofreeeurope.github.io`. Merging here alone does not deploy it.

## Publish the migration

1. Deploy the content migration and canonical correction in `ostsam/gfe` first.
   All destinations in `data/migration-redirects.json` must exist.
2. Merge the reviewed redirect source changes here.
3. Check out `gladiofreeeurope/gladiofreeeurope.github.io` and run:

   ```sh
   python3 scripts/build-redirects.py /path/to/gladiofreeeurope.github.io
   ```

4. Submit and merge the generated files into that repository's `master`.
   `.nojekyll` makes GitHub Pages serve all generated pages without exclusions.

The map matches old episode audio identities to current URLs. Supplemental pages,
topic archives, and episodes missing from the feed have been imported into the
new site. Each redirect has a matching canonical, immediate meta refresh, and
inline JavaScript preserving query parameters and fragments. The redirect runs
immediately after the charset declaration, with no separate script request or
wait for other page resources. The old script is retained for cached HTML.
Unknown URLs show a 404
with useful links rather than redirecting to a guessed destination.

The Hugo head partial consumes the same map. The redirect-only build above
requires only Python 3 and does not depend on a local Hugo installation.
