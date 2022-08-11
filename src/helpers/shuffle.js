const shuffle = arr => {
    const res = [...arr]
    let i = res.length
    let rand
    while (i !== 0) {
        rand = Math.floor(Math.random() * i)
        i--;
        [res[i], res[rand]] = [res[rand], res[i]]
    }
    return res
}

export default shuffle
