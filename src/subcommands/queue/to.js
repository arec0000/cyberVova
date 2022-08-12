import makeQueueSelect from '../../helpers/makeQueueSelect.js'

const to = async (interaction, player) => {
    const queueItems = player.queue('get')
    const current = player.queue('current')

    if (!queueItems.length) {
        return interaction.editReply({content: 'В очереди ничего нет', ephemeral: true})
    }

    const selectRow = makeQueueSelect('queue-to-select', queueItems, {current})

    interaction.editReply({components: [selectRow], ephemeral: true})

    const message = await interaction.fetchReply()
    const collector = message.createMessageComponentCollector({time: 900000})

    collector.on('collect', async i => {
        if (i.customId === 'queue-to-select') {
            const selectedIndex = +i.values[0].replace(/\..+/, '') - 1
            player.queue('to', selectedIndex)
            i.update({
                content: 'Указатель очереди перемещён на выбранный элемент',
                components: [],
                ephemeral: true
            })
            player.messageSender.send(`${interaction.user.username} переключил очередь на другой трек`)
            collector.stop()
        }
    })

    collector.on('end', collected => {
        console.log('Сборщик команды queue to остановлен')
    })
}

export default to
