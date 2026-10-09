import { useLayoutEffect } from 'react'
import WorkList from './WorkList'
import BackgroundBento from './BackgroundBento'
import ContactPanel from './ContactPanel'

/*
 * Everything below the hero, in a chunk of its own. App loads it once the
 * hero's entrance has played (or as soon as the visitor heads down the page),
 * so the first screen never waits on code for sections far below it. The
 * build-time prerender imports it directly and renders it in place.
 */
export default function BelowFold({ openSlug, onToggle, onShowModels, onMount }) {
  useLayoutEffect(() => {
    onMount?.()
  }, [onMount])

  return (
    <>
      <WorkList openSlug={openSlug} onToggle={onToggle} onShowModels={onShowModels} />
      <BackgroundBento />
      <ContactPanel />
    </>
  )
}
