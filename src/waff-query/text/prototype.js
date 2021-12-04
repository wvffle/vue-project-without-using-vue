Text.prototype.get = function () {
    return this.nodeValue
}

Text.prototype.set = function (value) {
    this.nodeValue = value
    return this
}
