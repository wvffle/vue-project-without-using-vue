import { isArrayLike } from '../utils/arrays'

const tags    = /^\*|^[A-Za-z0-9*_-]+$/
const ids     = /^#[A-Za-z0-9_-]+$/
const classes = /^\.[A-Za-z0-9_.-]+$/

export const q = (selector, root = document, single = true) => {
    selector = selector === ''
        ? root.children[0]
        : selector

    if (!selector) {
        selector = root === document
            ? document.body
            : 'body'
    }

    if (selector instanceof Element) {
        return single ? selector : [selector]
    }

    const querySelector = (selector, root) => {
        return single
            ? [root.querySelector(selector)]
            : [...root.querySelectorAll(selector)]
    }

    const queryElements = (selector) => {
        if (typeof selector === 'string') {
            selector = selector.trim()
        }

        if (!isArrayLike(root)) {
            root = [root]
        }

        if (selector[0] === '>') {
            selector = selector.slice(1).trim()
        }

        const res = []
        for (const $root of root) {
            if (typeof selector === 'function') {
                res.push(...[...$root.children].filter(selector))
                continue
            }

            if (tags.test(selector)) {
                res.push(...$root.getElementsByTagName(selector))
                continue
            }

            if (ids.test(selector)) {
                res.push($root.getElementById(selector.slice(1)))
                continue
            }

            if (classes.test(selector)) {
                res.push(...$root.getElementsByClassName(selector))
                continue
            }

            res.push(...querySelector(selector, $root))
        }

        return res
    }

    if (isArrayLike(selector)) {
        const res = []
        for (const $selector of selector) {
            if ($selector instanceof Element) {
                res.push($selector)
            } else if (typeof $selector === 'string') {
                res.push(...queryElements($selector))
            }

            if (single && res.length) {
                return res[0]
            }
        }

        return single ? null : res
    }

    if (typeof selector !== 'function' && typeof selector !== 'string') {
        throw 'selector must be a String, Element, Function or an Array'
    }

    const res = queryElements(selector)
    return single ? res[0] : [...new Set(res)]
}

export const qq = (selector, root) => q(selector, root, false)
