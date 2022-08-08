class Queue {

    _list = []
    current = 0
    loop = false

    get length() {
        return this._list.length
    }

    getList() {
        return this._list.slice()
    }

    push(urlsInfo) {
        this._list = [...this._list, ...urlsInfo]
    }

    pushAfterCurrent(urlInfo) {
        this._list.splice(this.current, 0, urlInfo)
    }

    resetCurrent() {
        this.current = 0
    }

    next() {
        return this.current < this._list.length ? this._list[this.current++].url : null
    }

}

export default Queue
