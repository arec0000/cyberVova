import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Снять с паузы')

export const execute = async interaction => {
    const player = interaction.client.players[interaction.guildId]
    if (player?.state === 'paused') {
        player.unpause()
        interaction.reply({content: 'Снято с паузы', ephemeral: true})
        player.messageSender.send(`${interaction.user.username} снял с паузы`)
    } else {
        interaction.reply({content: 'Нет никакой паузы..', ephemeral: true})
    }
}
