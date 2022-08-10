import { EmbedBuilder } from 'discord.js'

const info = (interaction, player) => {
    const queueItems = player.queue('get')
    const current = player.queue('current')

    if (!queueItems.length) {
        return interaction.editReply({content: 'В очереди ничего нет', ephemeral: true})
    }

    const embedFields = queueItems.map((queueItem, i) => {
        const pretty = queueItem.getPretty()
        const isNext = i === current ? ' - следующий' : ''
        return {
            name: `${i + 1}. ${pretty.type}${isNext}`,
            value: pretty.hyperlink
        }
    })

    const embed = new EmbedBuilder()
                .setColor('#202225')
                .addFields(...embedFields)

    interaction.editReply({embeds: [embed], ephemeral: true})
}

export default info
