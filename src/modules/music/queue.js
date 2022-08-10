class Queue {

    _list = []
    current = 0
    loop = false
    _isBlocked = false
    _blockingTask = null

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

    delete(indexes) {
        return this._block(new Promise(resolve => {
            let shift = 0
            this._list = this._list.filter((queueItem, i) => {
                const includes = indexes.includes(i)
                if (includes && i < this.current) {
                    shift++
                }
                return !includes
            })
            this.current -= shift
            resolve()
        }))
    }

    setCurrent(i) {
        this.current = i
    }

    resetCurrent() {
        this.current = 0
    }

    next() {
        if (!this._isBlocked) {
            return this.current < this._list.length ? this._list[this.current++].url : null
        } else {
            return new Promise(resolve => {
                this._blockingTask.then(() => {
                    resolve(this.current < this._list.length ? this._list[this.current++].url : null)
                })
            })
        }
    }

    _block(promise) {
        this._isBlocked = true
        this._blockingTask = promise
        promise.then(() => {
            this._isBlocked = false
            this._blockingTask = null
        })
        return promise
    }

}

export default Queue
