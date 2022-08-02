import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} from 'discord.js'
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from '@discordjs/voice'
import ytdl from 'ytdl-core'
import yts from 'yt-search'

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

    if (!url && !track) {
        return interaction.reply({content: 'Чё включать-то?', ephemeral: true})
    }

    if (!url) {
        const searchResult = await yts(track + (artist ? ' ' + artist: ''))
        if (!searchResult.videos.length) {
            return interaction.reply({content: 'Удивительно, но ничего не найдено', ephemeral: true})
        }
        url = searchResult.videos[0].url
    } else if (!ytdl.validateURL(url)) {
        return interaction.reply({content: 'Некорректный url', ephemeral: true})
    }

    const buffer = ytdl(url, {filter: 'audioonly'})

    const audio = createAudioResource(buffer)
    const audioPlayer = createAudioPlayer()
    const voiceConnection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    })
    audioPlayer.play(audio)
    voiceConnection.subscribe(audioPlayer)

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('stop-play')
                .setLabel('Выключите этот ужас')
                .setStyle(ButtonStyle.Secondary)
        )
    await interaction.reply({
        content: `Пользователь ${interaction.user.username} включил ${url}`,
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
