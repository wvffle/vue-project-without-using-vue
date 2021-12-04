import { Effect } from './effect'

export const watchEffect = fn => {
  const effect = new Effect(fn)
  return () => effect.stop()
}