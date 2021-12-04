import { ref } from './ref'

export const computed = (getter) => {
  return {
    __ref: true,
    get value () {
      return getter()
    }
  }
}

export const asyncComputed = (getter, def) => {
  const loaded = ref(false)
  const update = ref(0)
  let value = def

  return {
    __ref: true,
    isLoading: computed(() => !loaded.value),
    update: () => loaded.value = false,
    get value () {
      if (loaded.value) {
        return value
      }

      Promise.resolve()
        .then(getter)
        .then(val => {
          value = val
          loaded.value = true
        })
        .catch(err => {
          value = err
          loaded.value = true
        })

      return value
    }
  }
}