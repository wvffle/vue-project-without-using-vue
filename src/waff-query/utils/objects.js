export const prop = (object, prop, desc) => {
  const descriptor = {
    enumerable: true,
    configurable: true,
    get: desc.get,
    set: desc.set,
    wiratable: desc.writable
  }

  if ('value' in desc) {
    descriptor.value = desc.value
    delete descriptor.set
    delete descriptor.get
  }

  Object.defineProperty(object, prop, descriptor)
}