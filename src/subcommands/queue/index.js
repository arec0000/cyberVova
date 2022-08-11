import info from './info.js'
import add from './add.js'
import to from './to.js'
import deleteQueueItems from './delete.js'
import clear from './clear.js'
import loop from './loop.js'
import shuffle from './shuffle.js'

const queueSubcommands = {
    info: info,
    add: add,
    to: to,
    delete: deleteQueueItems,
    clear: clear,
    loop: loop,
    shuffle: shuffle,
}

const queueDispatcher = (subcommand, {interaction, player}) => {
    queueSubcommands[subcommand](interaction, player)
}

export default queueDispatcher
