import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder
} from 'discord.js'
import yts from 'yt-search'
import ytu from '../helpers/yt-url.js'
import Player from '../modules/player.js'
import Playlist from '../modules/playlist.js'

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Проиграть музыку в текущем голосовом канале')
    .addStringOption(option =>
        option.setName('url').setDescription('Youtube видео или плейлист'))
    .addStringOption(option =>
        option.setName('search').setDescription('Поисковый запрос'))

export const execute = async interaction => {

    const voiceChannel = interaction.member.voice.channel
    if (!voiceChannel) {
        return interaction.reply({content: 'Подключитесь к голосовому каналу', ephemeral: true})
    }

    let url = interaction.options.getString('url')
    const query = interaction.options.getString('search')
    let videoInfo = null
    let playlistInfo = null

    if (!url && !query) {
        return interaction.reply({content: 'Чё включать-то?', ephemeral: true})
    }

    if (!interaction.client.player) {
        interaction.client.player = new Player()
    }

    const { player } = interaction.client

    if (!player.voiceConnection) {
        player.connectToChannel(voiceChannel)
    }

    if (url) {
        /// возможно это стоит сделать частью плеера,
        /// если будет очередь, то он сам должен обрабатывать url
        const linkType = ytu.checkLinkType(url)
        if (!linkType) {
            return interaction.reply({content: 'Некорректный url', ephemeral: true})
        }
        if (linkType === 'video') {
            player.playTrack(url)
        } else {
            const listId = ytu.getPlaylistId(url)
            playlistInfo = await yts({listId})
            const playlist = new Playlist(playlistInfo)
            if (linkType === 'videoFromPlaylist') {
                playlist.setCurrent(ytu.getVideoId(url))
            }
            player.playPlaylist(playlist)
        }
        ///
    } else {
        const searchResult = await yts(query)
        if (!searchResult.videos.length) {
            return interaction.reply({content: 'Удивительно, но ничего не найдено', ephemeral: true})
        }
        videoInfo = searchResult.videos[0]
        url = videoInfo.url
        player.playTrack(url)
    }

    if (!videoInfo) {
        videoInfo = await yts({videoId: ytu.getVideoId(url)})
    }

    const embeds = [
        new EmbedBuilder()
            .setTitle(videoInfo.title)
            .setColor('#FF0000')
            .setImage(videoInfo.thumbnail)
            .setURL(url)
    ]

    if (player.state === 'playing-playlist') {
        embeds.push(
            new EmbedBuilder()
                .setTitle(playlistInfo.title)
                .setDescription('Плейлист')
                .setColor('#202225')
                .setThumbnail(playlistInfo.thumbnail)
                .setURL(playlistInfo.url)
        )
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('play-dora')
                .setLabel('Включить дору-дуру')
                .setStyle(ButtonStyle.Secondary)
        )

    await interaction.reply({
        content: `Пользователь ${interaction.user.username} включил:`,
        embeds,
        components: [row]
    })

    const message = await interaction.fetchReply()
    message.awaitMessageComponent({componentType: ComponentType.Button})
        .then(interaction => {
            player.playTrack('https://youtu.be/WNadEfGnV04')
            interaction.update({content: 'Ладно', embeds: [], components: []})
        })
        .catch(err => console.error(err))
}
