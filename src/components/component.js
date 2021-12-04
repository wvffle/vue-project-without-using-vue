import { computed, isRef, reactive, ref, watchEffect } from '../reactivity'
import { c, t } from '../waff-query'

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

  const createTemplate = (globalContext) => {
    const [root] = template.content.children

    const traverse = (root, context) => {
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
          for (const attr of child.getAttributeNames()) {
            const value = child.getAttribute(attr)

            /*
             * @<event>
             */
            if (attr.startsWith('@')) {
              child.removeAttribute(attr)
              child.addEventListener(attr.slice(1), () => {
                if (value in context) {
                  if (typeof context[value] === 'function') {
                    context[value]()
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
                array: null
              }

              value.replace(/^(\b.+\b) (?:in|of) (.+?)$/, (_, element, arr) => {
                data.element = element
                data.array = arr
              })

              const elements = []
              watchEffect(() => {
                for (const element of elements) {
                  element.remove()
                }

                elements.length = 0

                for (const el of [...runEvil(context, data.array)].reverse()) {
                  const element = child.cloneNode(true)
                  elements.push(element)
                  traverse(element, { ...context, [data.element]: el })
                  placeholder.after(element)
                }
              })
            }
          }

          if (!child.__removed) {
            traverse(child, { ...context })
          }
        }
      }
    }

    traverse(root, globalContext)
    return root
  }

  return createTemplate(await createContext())
}

export const example = () => parseComponent('Example')
