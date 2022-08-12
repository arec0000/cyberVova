const loop = (interaction, player) => {
    const isLoop = interaction.options.getBoolean('value')

    player.queue('loop', isLoop)

    if (isLoop) {
        interaction.editReply({
            content: 'Очередь постоянно будет перезапускаться',
            ephemeral: true
        })
        player.messageSender.send(`${interaction.user.username} зациклил очередь`)
    } else {
        interaction.editReply({
            content: 'Проигрывание прекратится, когда очередь подойдёт к концу',
            ephemeral: true
        })
        player.messageSender.send(`${interaction.user.username} отключид зацикливание очереди`)
    }
}

export default loop
