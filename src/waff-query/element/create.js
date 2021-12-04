import { parse } from '../utils/selector'
import { isArrayLike } from '../utils/arrays'
import { t } from '../text'

export const c = (selector, attrs = {}, children = false) => {
    if (isArrayLike(selector) || typeof selector === 'object') {
        attrs = selector
        selector = ''
    }

    const parsedSelector = parse(selector)
    const element = document.createElement(parsedSelector.tag || 'div')

    if (isArrayLike(attrs)) {
        if (children) {
            attrs = attrs.reduce((acc, attr) => {
                acc[attr] = ''
                return acc
            }, {})
        } else {
            children = attrs
            attrs = {}
        }
    }

    children = children || []

    element.id = parsedSelector.id || undefined
    element.className = parsedSelector.classes.join(' ')

    for (const child of children) {
        if (child instanceof Element) {
            element.appendChild(child)
            continue
        }

        element.appendChild(t(child))
    }

    for (const [attr, value] of Object.entries(parsedSelector.attrs)) {
        element.setAttribute(attr, value)
    }

    for (const [attr, value] of Object.entries(attrs)) {
        if (attr in element) {
            element[attr] = value
            continue
        }

        element.setAttribute(attr, value)
    }

    return element
}