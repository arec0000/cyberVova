import { SlashCommandBuilder } from 'discord.js'
import queueDispatcher from '../subcommands/queue/index.js'
import Player from '../modules/music/player.js'

export const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Взаимодействовать с очередью треков')
    .addSubcommand(subcommand =>
        subcommand
            .setName('info')
            .setDescription('Список треков/плейлистов'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Добавить треки/плейлисты в очередь (через пробел)')
            .addStringOption(option =>
                option.setName('urls').setDescription('Youtube видео или плейлисты').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('to')
            .setDescription('Переместиться в часть очереди'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('delete')
            .setDescription('Удалить часть плейлиста'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('clear')
            .setDescription('Очистить очередь'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('loop')
            .setDescription('Зациклить очередь')
            .addBooleanOption(option =>
                option.setName('value').setDescription('Значение').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('shuffle')
            .setDescription('Перемешать очередь'))

export const execute = async interaction => {

    await interaction.deferReply({ephemeral: true})

    if (!interaction.client.players[interaction.guildId]) {
        interaction.client.players[interaction.guildId] = new Player(interaction.guild)
    }

    const player = interaction.client.players[interaction.guildId]

    queueDispatcher(interaction.options.getSubcommand(), {interaction, player})
}
