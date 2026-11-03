/*
 * Inlined into the <head> of every page (the page-reveal plugin in
 * vite.config.js), so it runs before the page's first frame, ahead of any
 * module. It plays the page-to-page motion (App.css): a link followed to
 * another page of the site sinks this one out first (is-leaving), and the
 * page it opens rises in (is-entering). It also flags the link (is-navigating),
 * so the page spinner (SiteNav.css) shows if the next page takes a moment.
 */
;(function () {
  var html = document.documentElement
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  var LEAVE_MS = 220 // keep in step with vt-leave in App.css
  var ENTER_MS = 1200 // long enough for the home, which renders after its first frame

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]')
    if (!link || event.defaultPrevented || event.button || link.target || link.hasAttribute('download')) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    var url = new URL(link.href, location.href)
    if (url.origin !== location.origin || url.pathname === location.pathname) return
    html.classList.add('is-navigating')
    if (calm) return
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

  // The page rises in when it arrives from another page of the site. One
  // prerendered on hover (the speculation rules) has run this already, out
  // of sight, so it rises in once it's shown.
  function enter() {
    html.classList.add('is-entering')
    setTimeout(function () {
      html.classList.remove('is-entering')
    }, ENTER_MS)
  }

  var entry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]
  var reload = entry && entry.type === 'reload'
  if (!calm && !reload && document.referrer.indexOf(location.origin + '/') === 0) {
    if (document.prerendering) document.addEventListener('prerenderingchange', enter, { once: true })
    else enter()
  }
})()
