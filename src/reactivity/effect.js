const targetMap = new WeakMap()

export class Effect {
  static #stack = []
  static #trackStack = []
  static shouldTrack
  static active = undefined

  #deps = new Set()
  #runner = () => {}

  constructor (runner) {
    this.#runner = runner
    this.run()
  }

  track (dep) {
    this.#deps.add(dep)
    dep.add(this)
  }

  run () {
    if (Effect.#stack.includes(this)) {
      return
    }

    Effect.active = this
    Effect.#stack.push(this)
    Effect.resumeTracking()

    this.#runner()

    Effect.resetTracking()
    Effect.#stack.pop()

    Effect.active = Effect.#stack[Effect.#stack.length - 1]
  }

  stop () {
    for (const dep of this.#deps) {
      dep.delete(this)
      this.#deps.delete(dep)
    }
  }

  static resetTracking () {
    Effect.shouldTrack = Effect.#trackStack.pop() || true
  }

  static resumeTracking () {
    Effect.#trackStack.push(Effect.shouldTrack)
    Effect.shouldTrack = true
  }

  static pauseTracking () {
    Effect.#trackStack.push(Effect.shouldTrack)
    Effect.shouldTrack = false
  }
}

export const track = (target, key) => {
  if (!Effect.shouldTrack || Effect.active === undefined) {
    return
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map())
  }

  let dep = depsMap.get(key)

  if (!dep) {
    depsMap.set(key, dep = new Set())
  }

  Effect.active.track(dep)
}

export const trigger = (target, key) => {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const deps = []
  if (depsMap.has(key)) {
    deps.push(depsMap.get(key))

    if (key === 'length' && Array.isArray(target)) {
      deps.push(...[...depsMap.entries()].filter(([key, dep]) => {
        try {
          return +key >= target[key]
        } catch (e) {
          return false
        }
      }))
    }
  }

  for (const dep of deps) {
    for (const effect of dep) {
      if (effect !== Effect.active) {
        effect.run()
      }
    }
  }

}


