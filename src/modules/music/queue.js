class Queue {

    list = []
    current = 0
    loop = false

    get length() {
        return this.list.length
    }

    push(urlsInfo) {
        this.list = [...this.list, ...urlsInfo]
    }

    pushAfterCurrent(urlInfo) {
        this.list.splice(this.current, 0, urlInfo)
    }

    resetCurrent() {
        this.current = 0
    }

    next() {
        return this.current < this.list.length ? this.list[this.current++].url : null
    }

}

export default Queue
