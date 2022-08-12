const shuffle = (interaction, player) => {
    player.queue('shuffle')
    interaction.editReply({content: 'Очередь перемешана', ephemeral: true})
    player.messageSender.send(`${interaction.user.username} перемешал очередь`)
}

export default shuffle
