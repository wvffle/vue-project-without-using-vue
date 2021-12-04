import { reactive } from '../reactivity'
import { t } from '../waff-query'

const parser = new DOMParser()

// export const setup = async fn => {
//   const context = {}
//
//   const body = fn.toString().trim().replace(/^(?:async +)(?:function +)?\(\)(?: *=>)? *{|}$/g, '')
//   const xmlHack = body.replace(/{/g, '<block>').replace(/}/g, '</block>')
//   const { body: root } = parser.parseFromString(xmlHack, 'text/html')
//
//   for (const node of root.childNodes) {
//     if (node instanceof Text) {
//       node.nodeValue = node.nodeValue.split('\n')
//         .map(line => line.replace(/^( *)(?:let|const) (\w)/, '$1context.$2'))
//         .join('\n')
//     }
//   }
//
//   eval(root.textContent.replace(/<block>/g, '{').replace(/<\/block>/g, '}'))
//   console.log(context)
// }

const parseComponent = async componentName => {
  // const { template, default: data } = await import(`./components/${componentName.toLowerCase()}.js`)
  // const { body: { childNodes: nodes } } = parser.parseFromString(template.trim(), 'text/html')
  //
  // console.log(componentName, await data)
  // console.log(nodes)

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

  const createTemplate = (globalContext) => {
    const [root] = template.content.children

    const traverse = (root, context) => {
      for (const child of root.childNodes) {
        if (child instanceof Text) {
          const text = t(() => {
            return child.nodeValue.replace(/{{\s*(\w+?)\s*}}/g, (_, key) => {
              return context[key]?.value ?? context[key]
            })
          })

          root.replaceChild(text, child)
        }

        if (child instanceof Element) {
          for (const attr of child.getAttributeNames()) {
            if (attr.startsWith('@')) {
              const value = child.getAttribute(attr)
              child.removeAttribute(attr)
              child.addEventListener(attr.slice(1), () => {
                if (value in context) {
                  if (typeof context[value] === 'function') {
                    context[value]()
                  }
                } else {
                  (function () {
                    eval(`${Object.keys(context).map(k => `const ${k} = this['${k}'];`).join('\n')}\n ${value}`)
                  }).call(context)
                }
              })
            }
          }
          traverse(child, { ...context })
        }
      }
    }

    traverse(root, globalContext)
    return root
  }

  return createTemplate(await createContext())
}

export const example = () => parseComponent('Example')
