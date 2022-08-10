import { EmbedBuilder } from 'discord.js'
import QueueItem from '../../modules/music/queueItem.js'

const add = async (interaction, player) => {
    const urlsStr = interaction.options.getString('urls')

    if (urlsStr) {
        const urls = urlsStr.split(' ').filter(item => item.trim())

        const queueItems = []

        for (const url of urls) {
            const queueItem = new QueueItem(url)
            if (queueItem.type === 'incorrectUrl') {
                return interaction.editReply({
                    content: `Некорректный url\n${url}`,
                    ephemeral: true
                })
            }
            await queueItem.fetchTitle()
            queueItems.push(queueItem)
        }

        player.queue('push', queueItems)

        const embedFields = queueItems.map(queueItem => {
            const pretty = queueItem.getPretty()
            return {
                name: pretty.type,
                value: pretty.hyperlink
            }
        })

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} добавил в очередь`)
            .setColor('#202225')
            .addFields(...embedFields)

        interaction.editReply({embeds: [embed], ephemeral: true})
    }
}

export default add
