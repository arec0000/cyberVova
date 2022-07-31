import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Проиграть музыку в текущем голосовом канале')

export const execute = async interaction => {
    await interaction.reply('I\'m just exist')
}