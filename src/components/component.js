import { computed, isRef, not, reactive, ref, toRaw, watchEffect } from '../reactivity'
import { c, t } from '../waff-query'
import { Effect } from '../reactivity/effect'

const parser = new DOMParser()

const parseComponent = async componentName => {
  const { head: { children: [template, script] } } = parser.parseFromString(
    await fetch(`/src/components/${componentName}.vue`, { headers: { Accept: 'text/html' } })
      .then(res => res.text()),
    'text/html'
  )

  const body = script.innerHTML.replace(/import +(.+?) +from +(['"].+?['"])/g, "const $1 = await import($2)")
  const xmlHack = body.replace(/{/g, '<block>').replace(/}/g, '</block>')
  const { body: root } = parser.parseFromString(xmlHack, 'text/html')

  for (const node of root.childNodes) {
    if (node instanceof Text) {
      node.nodeValue = node.nodeValue.split('\n')
        .map(line => line.replace(/^( *)(let|const|var) (\w[^\s]+)/, '$1$2 $3 = context.$3'))
        .join('\n')
    }
  }

  const evil = root.innerHTML
    .replace(/<block>/g, '{')
    .replace(/<\/block>/g, '}')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')

  if (import.meta.env.DEV) {
    console.log(evil)
  }


  const createContext = async () => {
    const context = {}
    await eval(`(async () => {${evil}})()`)
    return context
  }

  const runEvil = (context, expr) => {
    const vars = Object.keys(context)
      .map(key => `const ${key} = context['${key}']`)

    for (const key in context) {
      if (isRef(context[key])) {
        expr = expr.replace(new RegExp(key, 'g'), `${key}.value`)
      }
    }

    return eval(`(function () { \n${vars.join('\n')}\nreturn ${expr} \n})()`)
  }

  const createTemplate = async (globalContext) => {
    const [root] = template.content.children

    const traverse = async (root, context) => {
      for (const child of root.childNodes) {
        if (child instanceof Text) {
          const text = t(() => {
            return child.nodeValue.replace(/{{\s*(.+?)\s*}}/g, (_, key) => {
              const res = runEvil(context, key)

              return typeof res === 'object'
                ? JSON.stringify(res)
                : res
            })
          })

          root.replaceChild(text, child)
        }

        if (child instanceof Element) {
          const Component = Object.entries(components)
            .find(([key]) => key.toUpperCase() === child.tagName)?.[1]

          if (Component) {
            child.replaceWith(await Component())
          }

          for (const attr of child.getAttributeNames()) {
            const value = child.getAttribute(attr)

            /*
             * :value
             */
            if (attr === ':value') {
              child.removeAttribute(attr)
              child.addEventListener('keydown', (event) => {
                setTimeout(() => {
                  runEvil(context, `(${value} = '${child.value}')`)
                }, 1)
              })

              child.addEventListener('change', (event) => {
                setTimeout(() => {
                  runEvil(context, `(${value} = '${child.value}')`)
                }, 1)
              })

              watchEffect(() => {
                const v = runEvil(context, value)
                if (not(v, child.value)) {
                  child.value = v
                }
              })
            }

            /*
             * @<event>
             */
            if (attr.startsWith('@')) {
              child.removeAttribute(attr)
              child.addEventListener(attr.slice(1), (event) => {
                if (value in context) {
                  if (typeof context[value] === 'function') {
                    context[value](event)
                  }
                } else {
                  runEvil(context, value)
                }
              })
            }

            /*
             * v-if
             */
            if (attr === 'v-if') {
              child.removeAttribute(attr)
              const placeholder = c('placeholder')
              placeholder.__v_if = child.__v_if = true
              const cond = placeholder.__if = child.__if = ref(false)
              placeholder.__else = child.__else = computed(() => !cond.value)

              watchEffect(() => {
                try {
                  if ((cond.value = runEvil(context, value))) {
                    root.replaceChild(child, placeholder)
                  } else {
                    root.replaceChild(placeholder, child)
                  }
                } catch (e) { }
              })
            }

            /*
             * v-else-if
             */
            if (attr === 'v-else-if') {
              child.removeAttribute(attr)
              const prev = child.previousElementSibling
              if (!prev || !prev.__v_if) {
                if (import.meta.env.DEV) {
                  console.log(prev)
                  console.error('v-else-if has to have v-if as previous sibling')
                }

                continue
              }

              const placeholder = c('placeholder')
              placeholder.__v_if = child.__v_if = true
              const cond = ref(false)
              placeholder.__if = child.__if = computed(() => !prev.__if.value && cond.value)
              placeholder.__else = child.__else = computed(() => prev.__else.value && !cond.value)

              watchEffect(() => {
                cond.value = runEvil(context, value)
                try {
                  if (child.__if.value) {
                    root.replaceChild(child, placeholder)
                  } else {
                    root.replaceChild(placeholder, child)
                  }
                } catch (e) { }
              })
            }

            /*
             * v-else
             */
            if (attr === 'v-else') {
              child.removeAttribute(attr)
              const prev = child.previousElementSibling
              if (!prev || !prev.__v_if) {
                if (import.meta.env.DEV) {
                  console.log(prev)
                  console.error('v-else-if has to have v-if as previous sibling')
                }

                continue
              }

              const placeholder = c('placeholder')
              placeholder.__v_if = child.__v_if = true
              placeholder.__if = child.__if = computed(() => prev.__else.value)

              watchEffect(() => {
                try {
                  if (child.__if.value) {
                    root.replaceChild(child, placeholder)
                  } else {
                    root.replaceChild(placeholder, child)
                  }
                } catch (e) { }
              })
            }

            /*
             * v-for
             */
            if (attr === 'v-for') {
              child.removeAttribute(attr)

              const placeholder = c('placeholder')
              child.before(placeholder)
              child.__removed = true
              child.remove()

              const data = {
                element: null,
                key: Symbol('key'),
                array: null
              }

              value.replace(/^(.+?) *(?:in|of) *(.+?)$/, (_, element, arr) => {

                data.element = element
                data.array = arr

                if (/\((\b.+?\b), (\b.+?\b)\)$/.test(element)) {
                  element.replace(/\((\b.+?\b), (\b.+?\b)\)$/, (_, element, key) => {
                    data.element = element
                    data.key = key
                  })
                }
              })

              const elements = []
              watchEffect(async () => {
                for (const element of elements) {
                  element.remove()
                }

                elements.length = 0

                for (const [key, el] of Object.entries(runEvil(context, data.array)).reverse()) {
                  const element = child.cloneNode(true)
                  elements.push(element)
                  await traverse(element, {
                    ...context,
                    [data.element]: el,
                    [data.key]: !isNaN(+key) ? +key : key
                  })

                  placeholder.after(element)
                }
              })
            }
          }

          if (!child.__removed) {
            await traverse(child, { ...context })
          }
        }
      }
    }

    await traverse(root, globalContext)
    return root
  }

  return createTemplate(await createContext())
}

export const components = {}
for (const path in import.meta.glob('./*.vue')) {
  const name = path.slice(2, -4)
  components[name] = () => parseComponent(name)
}
