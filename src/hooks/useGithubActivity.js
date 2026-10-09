import { useEffect, useState } from 'react'

// One request per page load, shared by every caller (and StrictMode's double mount).
let request = null

function load() {
  request ??= fetch('/.netlify/functions/github')
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`github ${res.status}`))))
    // A reply without the calendar (an upstream hiccup passed through) is an
    // error too: the tile shows its fallback instead of failing to render.
    .then((data) => (Array.isArray(data?.days) ? data : Promise.reject(new Error('github: no days'))))
    .catch((error) => {
      request = null
      throw error
    })
  return request
}

export function useGithubActivity() {
  const [state, setState] = useState({ status: 'loading', data: null })

  useEffect(() => {
    let live = true
    load().then(
      (data) => live && setState({ status: 'ready', data }),
      () => live && setState({ status: 'error', data: null })
    )
    return () => {
      live = false
    }
  }, [])

  return state
}
