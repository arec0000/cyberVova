import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('init')
    .setDescription('Инициализировать бота')

export const execute = async interaction => {
    const channelsMap = await interaction.guild.channels.fetch()
    const channels = Array.from(channelsMap.values())
    if (!channels.some(channel => channel.name === 'musichub')) {
        const channel = await interaction.guild.channels.create({
            name: 'musichub',
            reason: 'channel for interacting with the songs'
        })
        console.log(`Создан музыкальный канал: ${channel.id}`)
        interaction.reply({content: 'Создан музыкальный канал', ephemeral: true})
    } else {
        interaction.reply({content: 'Бот уже проинециализирован', ephemeral: true})
    }
}
