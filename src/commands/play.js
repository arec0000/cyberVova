import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} from 'discord.js'
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource
} from '@discordjs/voice'
import ytdl from 'ytdl-core'
import yts from 'yt-search'

import ytu from '../yt-url.js'
import Playlist from '../playlist.js'

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Проиграть музыку в текущем голосовом канале')
    .addStringOption(option =>
        option.setName('url').setDescription('Ссылка на youtube'))
    .addStringOption(option =>
        option.setName('track').setDescription('Название трека'))
    .addStringOption(option =>
        option.setName('artist').setDescription('Исполнитель'))

export const execute = async interaction => {

    const voiceChannel = interaction.member.voice.channel
    if (!voiceChannel) {
        return interaction.reply({content: 'Подключитесь к голосовому каналу', ephemeral: true})
    }

    let url = interaction.options.getString('url')
    const track = interaction.options.getString('track')
    const artist = interaction.options.getString('artist')

    let isPlaylist = false
    let ytPlaylist = null

    if (!url && !track) {
        return interaction.reply({content: 'Чё включать-то?', ephemeral: true})
    } else if (url) {
        const linkType = ytu.checkLinkType(url)
        if (!linkType) {
            return interaction.reply({content: 'Некорректный url', ephemeral: true})
        }
        if (linkType === 'playlist' || linkType === 'videoFromPlaylist') {
            isPlaylist = true
            const listId = ytu.getPlaylistId(url)
            const playlistInfo = await yts({listId})
            ytPlaylist = new Playlist(playlistInfo)
            if (linkType === 'videoFromPlaylist') {
                ytPlaylist.setCurrent(ytu.getVideoId(url))
            }
        }
    } else {
        const searchResult = await yts(track + (artist ? ' ' + artist: ''))
        if (!searchResult.videos.length) {
            return interaction.reply({content: 'Удивительно, но ничего не найдено', ephemeral: true})
        }
        url = searchResult.videos[0].url
    }

    const audioPlayer = createAudioPlayer()
    const voiceConnection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    })
    voiceConnection.subscribe(audioPlayer)

    if (!isPlaylist) {

        const buffer = ytdl(url, {
            filter: 'audioonly',
            fmt: 'mp3',
            highWaterMark: 1 << 62,
            liveBuffer: 1 << 62,
            dlChunkSize: 0,
            bitrate: 128,
            quality: 'lowestaudio'
       })
       const audio = createAudioResource(buffer)
       audioPlayer.play(audio)

    } else {

        const startNewSong = url => {
            const buffer = ytdl(url, {
                filter: 'audioonly',
                fmt: 'mp3',
                highWaterMark: 1 << 62,
                liveBuffer: 1 << 62,
                dlChunkSize: 0,
                bitrate: 128,
                quality: 'lowestaudio'
           })
           const audio = createAudioResource(buffer)
           audioPlayer.play(audio)
        }

        startNewSong(ytPlaylist.next())

        audioPlayer.on('stateChange', (oldState, newState) => {
            if (newState.status === 'idle') {
                startNewSong(ytPlaylist.next())
            }
       })

    }

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('stop-play')
                .setLabel('Выключите этот ужас')
                .setStyle(ButtonStyle.Secondary)
        )
    await interaction.reply({
        content: `Пользователь ${interaction.user.username} включил ${isPlaylist ? 'плейлист: ' : ''}${url}`,
        components: [row]
    })

    const message = await interaction.fetchReply()
    message.awaitMessageComponent({componentType: ComponentType.Button})
        .then(interaction => {
            voiceConnection.destroy()
            audioPlayer.stop()
            interaction.update({content: 'Воспроизведение остановлено', components: []})
        })
        .catch(err => console.error(err))
}
