/*
 * Inlined into the <head> of every page (the page-reveal plugin in
 * vite.config.js), because `pagereveal` fires before the page's first frame,
 * ahead of any module. It tags the page-to-page transition (App.css) with
 * the way it goes: deeper into the site (home → blog → post) or back out.
 * It also flags a link followed to another page, so the page spinner
 * (SiteNav.css) shows if the next page takes a moment. Where the browser has
 * no page-to-page view transitions (Firefox, Zen), it plays the same motion
 * by hand (is-leaving and is-entering in App.css).
 */
;(function () {
  var html = document.documentElement
  var native = 'CSSViewTransitionRule' in window
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  var LEAVE_MS = 220 // keep in step with vt-leave in App.css
  var ENTER_MS = 1200 // long enough for the home, which renders after its first frame

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
    html.classList.add('is-navigating')
    if (native || calm) return
    event.preventDefault()
    html.classList.add('is-leaving')
    setTimeout(function () {
      location.href = url.href
    }, LEAVE_MS)
  })

  // Back/forward brings a page back from memory exactly as it was left.
  addEventListener('pageshow', function () {
    html.classList.remove('is-navigating', 'is-leaving')
  })

  // By hand, the page rises in when it arrives from another page of the site.
  var entry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]
  var reload = entry && entry.type === 'reload'
  if (!native && !calm && !reload && document.referrer.indexOf(location.origin + '/') === 0) {
    html.classList.add('is-entering')
    setTimeout(function () {
      html.classList.remove('is-entering')
    }, ENTER_MS)
  }
})()
