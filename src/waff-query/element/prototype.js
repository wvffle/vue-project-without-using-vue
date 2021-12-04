import { q, qq } from './query'

Element.prototype.q = function (selector) {
    return q(selector, this)
}

Element.prototype.qq = function (selector) {
    return qq(selector, this)
}

// append
// attrs