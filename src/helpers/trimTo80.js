const trimTo80 = str => {
    if (str.length > 80) {
        return `${str.slice(0, 87)}...`
    } else {
        return str
    }
}

export default trimTo80
