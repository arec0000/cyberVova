const loop = (interaction, player) => {
    const isLoop = interaction.options.getBoolean('value')

    player.queue('loop', isLoop)

    if (isLoop) {
        interaction.editReply({
            content: 'Очередь постоянно будет перезапускаться',
            ephemeral: true
        })
    } else {
        interaction.editReply({
            content: 'Проигрывание прекратится, когда очередь подойдёт к концу',
            ephemeral: true
        })
    }
}

export default loop
