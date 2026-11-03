/*
 * Inlined into the <head> of every page (the page-reveal plugin in
 * vite.config.js), because `pagereveal` fires before the page's first frame,
 * ahead of any module. It tells the page-to-page transition (App.css) which
 * way it goes: deeper into the site (home → blog → post) or back out.
 */
;(function () {
  function depth(url) {
    return new URL(url, location.href).pathname.split('/').filter(Boolean).length
  }

  // The transition that brought this page in, or null once the page shows
  // without one. The home holds its first render until it's done (main.jsx).
  var revealed
  window.pageTransition = new Promise(function (resolve) {
    revealed = resolve
  })
  if (!('onpagereveal' in window)) revealed(null)

  addEventListener('pagereveal', function (event) {
    var transition = event.viewTransition
    revealed(transition)
    if (!transition) return
    // Back/forward keeps the referrer of the original visit, so prefer the
    // Navigation API's record of the page this one replaced.
    var activation = window.navigation && window.navigation.activation
    var from = activation ? activation.from && activation.from.url : document.referrer
    if (!from) return
    transition.types.add(depth(location.href) < depth(from) ? 'back' : 'forward')
  })
})()
