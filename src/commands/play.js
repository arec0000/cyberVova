import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} from 'discord.js'
import yts from 'yt-search'
import Player from '../modules/music/player.js'

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

    await interaction.deferReply()

    const url = interaction.options.getString('url')
    const query = interaction.options.getString('search')

    if (!url && !query) {
        return interaction.reply({content: 'Чё включать-то?', ephemeral: true})
    }

    if (!interaction.client.players[interaction.guildId]) {
        interaction.client.players[interaction.guildId] = new Player()
        console.log(`Создан новый плеер на сервере ${interaction.guild.name}`)
    }

    const player = interaction.client.players[interaction.guildId]

    if (player.state === 'disconnected') {
        player.connectToChannel(voiceChannel)
    }

    if (url) {
        const response = await player.defineTypeAndPlay(url)
        if (response === 'incorrectUrl') {
            return interaction.editReply({content: 'Некорректный url', ephemeral: true})
        }
    } else {
        const searchResult = await yts(query)
        if (!searchResult.videos.length) {
            return interaction.editReply({content: 'Удивительно, но ничего не найдено', ephemeral: true})
        }
        player.playTrack(searchResult.videos[0].url)
    }

    const trackEmbedUrl = `[](${player.currentTrack.url})`

    const playlistEmbedUrl = player.currentTrack.playlist?.type === 'youtube'
        ? `[](${player.currentTrack.playlist.youtube.url})` : ''

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('play-dora')
                .setLabel('Включите лучше дору')
                .setStyle(ButtonStyle.Danger)
        )

    await interaction.editReply({
        content: `Пользователь ${interaction.user.username} включил:${trackEmbedUrl} ${playlistEmbedUrl}`,
        components: [row]
    })

    const message = await interaction.fetchReply()

    const collector = message.createMessageComponentCollector({componentType: ComponentType.Button})

    collector.on('collect', i => {
        if (i.customId === 'play-dora') {
            player.playTrack('https://youtu.be/WNadEfGnV04')
            i.update({content: 'Ладно', components: []})
            collector.stop()
        }
        console.log(`Нажата кнопка ${i.customId}`)
    })

    collector.on('end', collected => {
        console.log('Сборщик остановлен')
    })

}
