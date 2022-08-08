import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

import getLinkInfo from '../helpers/getLinkInfo.js'
import Player from '../modules/music/player.js'

const makeQueueList = (urlsInfo, ops) =>
    urlsInfo.map((urlInfo, i) => {
        const index = ops?.ordered ? `${i + 1}. ` : ''
        const next = ops?.current === i ? ' - следующий' : ''
        return {
            name: `${index}${urlInfo.type === 'video' ? 'трек' : 'плейлист'}${next}`,
            value: `[${urlInfo.title}](${urlInfo.url})`
        }
    })

export const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Взаимодействовать с очередью треков')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Добавить треки/плейлисты в очередь (через пробел)')
            .addStringOption(option =>
                option.setName('urls').setDescription('Youtube видео или плейлисты').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('info')
            .setDescription('Список треков/плейлистов'))

export const execute = async interaction => {

    await interaction.deferReply()

    if (!interaction.client.players[interaction.guildId]) {
        interaction.client.players[interaction.guildId] = new Player()
    }

    const player = interaction.client.players[interaction.guildId]

    if (interaction.options.getSubcommand() === 'add') {

        const urlsStr = interaction.options.getString('urls')

        if (urlsStr) {
            const urls = urlsStr.split(' ').filter(item => item.trim())

            const urlsInfo = []

            for (const url of urls) {
                urlsInfo.push(await getLinkInfo(url))
            }

            player.queue('push', urlsInfo)

            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username} добавил в очередь`)
                .setColor('#202225')
                .addFields(...makeQueueList(urlsInfo))

            interaction.editReply({embeds: [embed], ephemeral: true})
        }

    } else if (interaction.options.getSubcommand() === 'info') {
        const queueInfo = player.queue('get')
        const embed = new EmbedBuilder()
                .setColor('#202225')
                .addFields(...makeQueueList(queueInfo, {
                    ordered: true,
                    current: player.queue('current')
                }))
        interaction.editReply({embeds: [embed], ephemeral: true})
    }
}
