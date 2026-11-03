// Apple keyboards say ⌘ where everyone else says Ctrl. Browser-only: call it
// after mount, never during the prerender.
export function isMacLike() {
  const platform = navigator.userAgentData?.platform ?? navigator.platform ?? ''
  return /mac|iphone|ipad/i.test(platform)
}
