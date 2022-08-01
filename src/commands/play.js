import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Проиграть музыку в текущем голосовом канале')
    .addStringOption(option =>
        option.setName('url').setDescription('Ссылка на youtube').setRequired(true))

export const execute = async interaction => {
    await interaction.reply('I\'m just exist')
    console.log(interaction.options.getString('url'))
}
