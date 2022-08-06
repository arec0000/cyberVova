import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('init')
    .setDescription('Инициализировать бота')

export const execute = async interaction => {
    const channels = await interaction.guild.channels.fetch()
    if (!channels.has('1005524559497277511')) {
        const channel = await interaction.guild.channels.create({
            name: 'musicHub',
            reason: 'channel for interacting with the songs'
        })
        console.log(`Создан музыкальный канал: ${channel.id}`)
        //записывать id в базу, чтобы потом проверять
    }
}
