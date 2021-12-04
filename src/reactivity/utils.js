import { isRef } from './ref'
import { isReactive } from './reactive'

export const equals = (ref1, ref2) => {
  if (isRef(ref1)) ref1 = ref1.value
  if (isRef(ref2)) ref2 = ref2.value
  return ref1 === ref2
}

export const not = (ref1, ref2) => !equals(ref1, ref2)

export const toRaw = refOrReactive => {
  if (isRef(refOrReactive)) {
    return refOrReactive.value
  }

  if (isReactive(refOrReactive)) {
    return refOrReactive.$target
  }

  return refOrReactive
}