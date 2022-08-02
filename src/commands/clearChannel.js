import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Удалить все сообщения в канале')
    .addChannelOption(option =>
        option.setName('channel').setDescription('Выберите канал').setRequired(true))

export const execute = async interaction => {
    const channel = await interaction.options.getChannel('channel')
    const messages = await channel.messages.fetch()
    if (!messages.size) {
        return interaction.reply({content: 'В канале нет сообщений', ephemeral: true})
    }
    await channel.bulkDelete(messages)
    interaction.reply({content: 'Канал очищен', ephemeral: true})
}
