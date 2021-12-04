import { watchEffect } from '../../reactivity'

export const t = (text = '') => {
  const node = document.createTextNode(typeof text === 'function' ? text() : text)
  watchEffect(() => node.set(typeof text === 'function' ? text() : text?.value ?? text))
  return node
}