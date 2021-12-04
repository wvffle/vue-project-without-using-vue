const attributes = /\[([a-z][a-z0-9-_]*)(\||\*|\^|\$|~|)=([^\]]+)]/gi

export const parse = selector => {
    let tag = false
    let id = false
    const attrs = {}

    if (selector == null) {
        return {
            tag: false,
            id: false,
            classes: [],
            attrs: {}
        }
    }

    selector = selector.replace(attributes,(_, name, operator, value) => {
        value = value.replace(/^'(.+)'$|^"(.+)"$/,(_, n1, n2) => n1 || n2)

        attrs[name] = {
            operator,
            value,
            toString () {
                return value
            }
        }

        return ''
    })

    const classes = selector.split('.')

    if (selector[0] !== '.') {
        const tagId = classes[0].split('#')

        tag = tagId[0] || false
        id = tagId[1] || false
    }

    classes.splice(0, 1)

    for (let i = 0; i < classes.length; ++i) {
        const classId = classes[i].split('#')

        if (classId.length > 1) {
            id = id || classId[1]
            classes[i] = classId[0]
        }
    }

    return { tag, id, classes, attrs }
}