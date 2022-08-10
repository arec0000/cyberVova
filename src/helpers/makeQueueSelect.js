import { ActionRowBuilder, SelectMenuBuilder } from 'discord.js'
import trimTo80 from './trimTo80.js'

const makeQueueSelect = (customId, queueItems, ops) => {

    const selectOptions = queueItems.map((queueItem, i) => {
        const pretty = queueItem.getPretty()
        const isNext = i === ops.current ? ' - следующий' : ''
        return {
            label: `${i + 1}. ${trimTo80(queueItem.title)}`,
            description: `${pretty.type}${isNext}`,
            value: `${i + 1}. ${queueItem.title}`
        }
    })

    const selectMenu = new SelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder('Выберите треки/плейлисты')
        .setOptions(selectOptions)

    if (ops.multiselect) {
        selectMenu.setMinValues(1).setMaxValues(selectOptions.length)
    }

    return new ActionRowBuilder().addComponents(selectMenu)

}

export default makeQueueSelect
