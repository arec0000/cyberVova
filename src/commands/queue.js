import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

import getLinkInfo from '../helpers/getLinkInfo.js'
import Player from '../modules/music/player.js'

export const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Взаимодействовать с очередью треков')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Добавить треки/плейлисты в очередь (через пробел)')
            .addStringOption(option =>
                option.setName('urls').setDescription('Youtube видео или плейлисты').setRequired(true)))

export const execute = async interaction => {

    await interaction.deferReply()

    if (!interaction.client.players[interaction.guildId]) {
        interaction.client.players[interaction.guildId] = new Player()
    }

    if (interaction.options.getSubcommand() === 'add') {

        const urlsStr = interaction.options.getString('urls')

        if (urlsStr) {
            const urls = urlsStr.split(' ').filter(item => item.trim())

            const urlsInfo = []

            for (const url of urls) {
                urlsInfo.push(await getLinkInfo(url))
            }

            interaction.client.players[interaction.guildId].queue('push', urlsInfo)

            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username} добавил в очередь`)
                .setColor('#202225')
                .addFields(...urlsInfo.map(urlInfo =>
                    ({
                        name: urlInfo.type === 'video' ? 'трек' : 'плейлист',
                        value: `[${urlInfo.title}](${urlInfo.url})`})
                ))

            interaction.editReply({embeds: [embed], ephemeral: true})
        }
    }
}
