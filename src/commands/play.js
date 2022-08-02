import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} from 'discord.js'
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from '@discordjs/voice'
import ytdl from 'ytdl-core'

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Проиграть музыку в текущем голосовом канале')
    .addStringOption(option =>
        option.setName('url').setDescription('Ссылка на youtube').setRequired(true))

export const execute = async interaction => {

    const voiceChannel = interaction.member.voice.channel
    if (!voiceChannel) {
        return interaction.reply({content: 'Подключитесь к голосовому каналу', ephemeral: true})
    }

    const url = interaction.options.getString('url').trim()
    if (!ytdl.validateURL(url)) {
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
        content: `Пользователь ${interaction.user.username} включил чё-то`,
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
