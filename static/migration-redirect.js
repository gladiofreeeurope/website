// Compatibility for cached old redirect HTML; newly built pages redirect inline.
(() => {
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) return;
  const destination = new URL(canonical.href);
  destination.search = window.location.search;
  destination.hash = window.location.hash;
  window.location.replace(destination.href);
})();
