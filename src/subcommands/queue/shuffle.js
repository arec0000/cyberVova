const shuffle = (interaction, player) => {
    player.queue('shuffle')
    interaction.editReply({content: 'Очередь перемешана', ephemeral: true})
}

export default shuffle
