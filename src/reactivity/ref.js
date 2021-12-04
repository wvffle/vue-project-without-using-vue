import { reactive } from './reactive'
import { not } from './utils'

const refs = reactive({}, true)
let refCount = 0

class Ref {
  #id = refCount++

  constructor (value = null) {
    refs[this.#id] = value
  }

  get value () {
    return refs[this.#id]
  }

  set value (value) {
    if (not(value, refs[this.#id])) {
      refs[this.#id] = value
    }
  }
}

export const ref = value => new Ref(value)
export const isRef = ref => ref instanceof Ref || typeof ref === 'object' && ref.__ref === true
