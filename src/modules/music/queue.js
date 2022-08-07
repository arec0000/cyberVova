class Queue {

    list = []
    current = 0

    get length() {
        return this.list.length
    }

    push(tracksInfo) {
        this.list = [...this.list, ...tracksInfo]
    }

    pushAfterCurrent(trackObj) {
        if (this.list.length) {
            this.list.splice(this.current + 1, 0, trackObj)
        } else {
            this.list.push(trackObj)
        }
    }

    next() {
        return this.current < this.list.length ? this.list[this.current++].url : null
    }

}

export default Queue
