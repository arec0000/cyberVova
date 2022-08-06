import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Поставить на паузу')

export const execute = async interaction => {
    if (interaction.client.player?.state === 'playing') {
        interaction.client.player.pause()
        interaction.reply(`${interaction.user.username} поставил на паузу`)
    } else {
        interaction.reply({content: 'Ничего не включено', ephemeral: true})
    }
}
