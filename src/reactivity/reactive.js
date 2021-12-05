import { isRef } from './ref'
import { Effect, track, trigger } from './effect'
import { not, toRaw } from './utils'

class Reactive {
  __newKey = Symbol('new')

  constructor (target, shallow) {
    const self = this
    this.$target = target

    return new Proxy(target, {
      get (target, key, receiver) {
        if (key === '$target') {
          return target
        }

        self.__preGet(target, key, receiver)

        const value = Reflect.get(target, key, receiver)

        // Do not track prototype and symbols
        if (key === '__proto__' || key === '__dirty' || typeof key === 'symbol') {
          return value
        }

        track(target, key)

        if (isRef(value)) {
          return self.__unwrap(key, value)
        }

        // Deep reactivity
        if (!shallow && typeof value === 'object') {
          return reactive(value)
        }

        return value
      },

      set (target, key, value, receiver) {
        const existed = self.__hasKey(target, key)
        const oldValue = target[key]

        // Update ref keys
        if (!isRef(value) && isRef(oldValue)) {
          oldValue.value = value
          return true
        }

        const result = Reflect.set(target, key, value, receiver)

        // Trigger only on change
        if (result && not(value, oldValue)) {
          trigger(target, key)
        }

        if (!existed) {
          trigger(target, self.__newKey)
        }

        return result
      },

      deleteProperty (target, key) {
        const existed = key in target
        const result = Reflect.deleteProperty(target, key)

        if (result && existed) {
          trigger(target, key)
        }

        return result
      },

      has (target, key) {
        const result =  Reflect.has(target, key)
        if (typeof key !== 'symbol') {
          track(target, key)
        }

        return result
      },

      ownKeys (target) {
        track(target, self.__newKey)
        return Reflect.ownKeys(target)
      }
    })
  }

  __preGet (target, key, receiver) {}
  __unwrap (key, value) { return value }
  __hasKey (target, key) {
    return key in target
  }

}

class ReactiveArray extends Reactive {
  #accessor = (key) => function (...args) {
    const arr = this

    for (let i = 0; i < arr.length; ++i) {
      track(arr, `${i}`)
    }

    const res = arr[key](...args)
    if (res === false || res === -1) {
      return arr[key](...args.map(toRaw))
    }

    return res
  }

  #modifier = (key) => function (...args) {
    Effect.pauseTracking()
    const res = this[key].apply(this, ...args)
    Effect.resumeTracking()
    return res
  }

  __preGet (target, key, receiver) {
    if (key === 'length') {
      for (let i = 0; i < target.length + 1; ++i) {
        track(target, `${i}`)
      }
    }

    if (key in ['includes', 'indexOf', 'lastIndexOf']) {
      return Reflect.get(this, key, receiver)
    }

    if (key in ['push', 'pop', 'splice', 'shift', 'unshift']) {
      return Reflect.get(this, key, receiver)
    }
  }

  __unwrap (key, value) {
    return !isNaN(+key) ? value : value.value
  }

  __hasKey (target, key) {
    return +key < target.length || super.__hasKey(target, key)
  }

  includes (...args) {
    return this.#accessor('includes').apply(this, ...args)
  }

  indexOf (...args) {
    return this.#accessor('indexOf').apply(this, ...args)
  }

  lastIndexOf (...args) {
    return this.#accessor('lastIndexOf').apply(this, ...args)
  }

  push (...args) {
    return this.#modifier('push').apply(this, ...args)
  }

  pop (...args) {
    return this.#modifier('pop').apply(this, ...args)
  }

  splice (...args) {
    return this.#modifier('splice').apply(this, ...args)
  }

  shift (...args) {
    return this.#modifier('shift').apply(this, ...args)
  }

  unshift (...args) {
    return this.#modifier('unshift').apply(this, ...args)
  }
}

export const reactive = (target, shallow = false) => {
  if (isReactive(target)) {
    return target
  }

  return Array.isArray(target)
    ? new ReactiveArray(target, shallow)
    : new Reactive(target, shallow)
}

export const isReactive = reactive => reactive instanceof Reactive || !('$target' in reactive) && !!reactive.$target