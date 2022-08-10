import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import makeQueueSelect from '../../helpers/makeQueueSelect.js'

const deleteQueueItems = async (interaction, player) => {
    const queueItems = player.queue('get')
    const current = player.queue('current')

    if (!queueItems.length) {
        return interaction.editReply({content: 'В очереди ничего нет', ephemeral: true})
    }

    const selectRow = makeQueueSelect('queue-delete-select', queueItems, {current, multiselect: true})

    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('queue-back-btn')
                .setLabel('Назад')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('queue-delete-btn')
                .setLabel('Удалить')
                .setStyle(ButtonStyle.Danger)
        )

    interaction.editReply({components: [selectRow], ephemeral: true})

    const message = await interaction.fetchReply()
    const collector = message.createMessageComponentCollector({time: 900000})

    let selectedIndexes = null

    collector.on('collect', async i => {
        if (i.customId === 'queue-delete-select') {
            selectedIndexes = i.values.map(value => +value.replace(/\..+/, '') - 1)
            const embedFields = selectedIndexes.map(i => {
                const pretty = queueItems[i].getPretty()
                const isNext = (i) === current ? ' - следующий' : ''
                return {
                    name: `${i + 1}. ${pretty.type}${isNext}`,
                    value: pretty.hyperlink
                }
            })
            const embed = new EmbedBuilder()
                .setTitle('Удалить?')
                .setColor('#202225')
                .addFields(...embedFields)
            i.update({embeds: [embed], components: [buttonRow], ephemeral: true})
        } else if (i.customId === 'queue-back-btn') {
            i.update({embeds: [], components: [selectRow], ephemeral: true})
        } else if (i.customId === 'queue-delete-btn') {
            await i.update({content: 'Элементы удаляются', embeds: [], components: [], ephemeral: true})
            await player.queue('delete', selectedIndexes)
            i.editReply({content: 'Элементы удалены', ephemeral: true})
            collector.stop()
        }
    })

    collector.on('end', collected => {
        console.log('Сборщик команды queue delete остановлен')
    })
}

export default deleteQueueItems
