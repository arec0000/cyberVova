import { SlashCommandBuilder } from 'discord.js'
import yts from 'yt-search'
import Player from '../modules/music/player.js'
import QueueItem from '../modules/music/queueItem.js'

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Добавить в очередь после текущего трека и проиграть')
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

    if (!interaction.client.players[interaction.guildId]) {
        interaction.client.players[interaction.guildId] = new Player(interaction.guild)
        console.log(`Создан новый плеер на сервере ${interaction.guild.name}`)
    }

    const player = interaction.client.players[interaction.guildId]

    if (player.state === 'disconnected') {
        player.connectToChannel(voiceChannel)
    }

    const url = interaction.options.getString('url')
    const query = interaction.options.getString('search')

    if (!url && !query) {
        const response = player.queue('play')
        if (response === 'queueIsEmpty') {
            player.disconnect()
            return interaction.editReply({content: 'Чё включать-то?', ephemeral: true})
        }
        return interaction.editReply({content: 'Проигрывание треков из очереди'})
    }

    if (url) {
        const queueItem = new QueueItem(url)
        if (queueItem.type === 'incorrectUrl') {
            return interaction.editReply({content: 'Некорректный url', ephemeral: true})
        }
        await queueItem.fetchTitle()
        player.queue('pushAfterCurrent', queueItem)
    } else {
        const searchResult = await yts(query)
        if (!searchResult.videos.length) {
            return interaction.editReply({content: 'Удивительно, но ничего не найдено', ephemeral: true})
        }
        const queueItem = new QueueItem(searchResult.videos[0].url)
        await queueItem.fetchTitle()
        player.queue('pushAfterCurrent', queueItem)
    }

    const type = player.currentTrack.playlist ? 'Плейлист' : 'Трек'

    interaction.editReply({content: `${type} добавлен в очередь и включен`, ephemeral: true})

}
