/*
 * Inlined into the <head> of every page (the page-reveal plugin in
 * vite.config.js), because `pagereveal` fires before the page's first frame,
 * ahead of any module. It tags the page-to-page transition (App.css) with
 * the way it goes: deeper into the site (home → blog → post) or back out.
 * It also flags a link followed to another page, so the page spinner
 * (SiteNav.css) shows if the next page takes a moment.
 */
;(function () {
  function depth(url) {
    return new URL(url, location.href).pathname.split('/').filter(Boolean).length
  }

  // The transition that brought this page in, or null once the page shows
  // without one. The home's prerendered nav stays until it's done (boot.js).
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

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]')
    if (!link || event.defaultPrevented || event.button || link.target || link.hasAttribute('download')) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    var url = new URL(link.href, location.href)
    if (url.origin !== location.origin || url.pathname === location.pathname) return
    document.documentElement.classList.add('is-navigating')
  })

  // Back/forward brings a page back from memory exactly as it was left.
  addEventListener('pageshow', function () {
    document.documentElement.classList.remove('is-navigating')
  })
})()
