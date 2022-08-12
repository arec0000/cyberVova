import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Выключить этот ужас')

export const execute = async interaction => {
    const player = interaction.client.players[interaction.guildId]
    if (player) {
        player.disconnect()
        interaction.reply({content: 'Воспроизведение выключено', ephemeral: true})
        player.messageSender.send(`${interaction.user.username} выключил воспроизведение`)
    } else {
        interaction.reply({content: 'Ничего не включено', ephemeral: true})
    }
}
