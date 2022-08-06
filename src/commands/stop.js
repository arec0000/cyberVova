import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Выключить этот ужас')

export const execute = async interaction => {
    if (interaction.client.player) {
        interaction.client.player.disconnect()
        interaction.reply(`${interaction.user.username} выключил воспроизведение`)
    } else {
        interaction.reply({content: 'Ничего не включено', ephemeral: true})
    }
}
