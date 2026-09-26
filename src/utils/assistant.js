// Lets any part of the page open the chat panel without prop drilling.
export const ASSISTANT_OPEN_EVENT = 'assistant:open'

export function openAssistant() {
  window.dispatchEvent(new CustomEvent(ASSISTANT_OPEN_EVENT))
}
