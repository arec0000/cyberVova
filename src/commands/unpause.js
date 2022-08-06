import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Снять с паузы')

export const execute = async interaction => {
    if (interaction.client.player?.state === 'paused') {
        interaction.client.player.unpause()
        interaction.reply(`${interaction.user.username} снял с паузы`)
    } else {
        interaction.reply({content: 'Нет никакой паузы..', ephemeral: true})
    }
}
