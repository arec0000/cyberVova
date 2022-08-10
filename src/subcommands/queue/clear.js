const clear = async (interaction, player) => {
    const queueItems = player.queue('get')
    const indexes = queueItems.map((item, i) => i)

    await interaction.editReply({content: 'Элементы удаляются', ephemeral: true})
    await player.queue('delete', indexes)
    interaction.editReply({content: 'Элементы удалены', ephemeral: true})
}

export default clear
