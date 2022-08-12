const clear = async (interaction, player) => {
    const queueItems = player.queue('get')
    if (!queueItems.length) {
        return interaction.editReply({content: 'Очередь пуста', ephemeral: true})
    }
    const indexes = queueItems.map((item, i) => i)
    await interaction.editReply({content: 'Элементы удаляются', ephemeral: true})
    await player.queue('delete', indexes)
    interaction.editReply({content: 'Элементы удалены', ephemeral: true})
    player.messageSender.send(`${interaction.user.username} очистил очередь`)
}

export default clear
