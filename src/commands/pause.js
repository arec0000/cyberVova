import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Поставить на паузу')

export const execute = async interaction => {
    const player = interaction.client.players[interaction.guildId]
    if (player?.state === 'playing') {
        player.pause()
        interaction.reply(`${interaction.user.username} поставил на паузу`)
    } else {
        interaction.reply({content: 'Ничего не включено', ephemeral: true})
    }
}
