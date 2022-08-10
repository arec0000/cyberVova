import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js'
import Player from '../modules/music/player.js'
import QueueItem from '../modules/music/queueItem.js'
import trimTo80 from '../helpers/trimTo80.js'

const makeQueueSelect = (customId, queueItems, ops) => {

        const selectOptions = queueItems.map((queueItem, i) => {
            const pretty = queueItem.getPretty()
            const isNext = i === ops.current ? ' - следующий' : ''
            return {
                label: `${i + 1}. ${trimTo80(queueItem.title)}`,
                description: `${pretty.type}${isNext}`,
                value: `${i + 1}. ${queueItem.title}`
            }
        })

        const selectMenu = new SelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder('Выберите треки/плейлисты')
            .setOptions(selectOptions)

        if (ops.multiselect) {
            selectMenu.setMinValues(1).setMaxValues(selectOptions.length)
        }

        return new ActionRowBuilder().addComponents(selectMenu)

}

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

export const execute = async interaction => {

    await interaction.deferReply({ephemeral: true})

    if (!interaction.client.players[interaction.guildId]) {
        interaction.client.players[interaction.guildId] = new Player()
    }

    const player = interaction.client.players[interaction.guildId]

    if (interaction.options.getSubcommand() === 'info') {

        const queueItems = player.queue('get')
        const current = player.queue('current')

        if (!queueItems.length) {
            return interaction.editReply({content: 'В очереди ничего нет', ephemeral: true})
        }

        const embedFields = queueItems.map((queueItem, i) => {
            const pretty = queueItem.getPretty()
            const isNext = i === current ? ' - следующий' : ''
            return {
                name: `${i + 1}. ${pretty.type}${isNext}`,
                value: pretty.hyperlink
            }
        })

        const embed = new EmbedBuilder()
                .setColor('#202225')
                .addFields(...embedFields)

        interaction.editReply({embeds: [embed], ephemeral: true})

    } else if (interaction.options.getSubcommand() === 'add') {

        const urlsStr = interaction.options.getString('urls')

        if (urlsStr) {
            const urls = urlsStr.split(' ').filter(item => item.trim())

            const queueItems = []

            for (const url of urls) {
                const queueItem = new QueueItem(url)
                if (queueItem.type === 'incorrectUrl') {
                    return interaction.editReply({
                        content: `Некорректный url\n${url}`,
                        ephemeral: true
                    })
                }
                await queueItem.fetchTitle()
                queueItems.push(queueItem)
            }

            player.queue('push', queueItems)

            const embedFields = queueItems.map(queueItem => {
                const pretty = queueItem.getPretty()
                return {
                    name: pretty.type,
                    value: pretty.hyperlink
                }
            })

            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username} добавил в очередь`)
                .setColor('#202225')
                .addFields(...embedFields)

            interaction.editReply({embeds: [embed], ephemeral: true})
        }

    } else if (interaction.options.getSubcommand() === 'to') {

        const queueItems = player.queue('get')
        const current = player.queue('current')

        if (!queueItems.length) {
            return interaction.editReply({content: 'В очереди ничего нет', ephemeral: true})
        }

        const selectRow = makeQueueSelect('queue-to-select', queueItems, {current})

        interaction.editReply({components: [selectRow], ephemeral: true})

        const message = await interaction.fetchReply()
        const collector = message.createMessageComponentCollector({time: 900000})

        collector.on('collect', async i => {
            if (i.customId === 'queue-to-select') {
                const selectedIndex = +i.values[0].replace(/\..+/, '') - 1
                player.queue('to', selectedIndex)
                i.update({
                    content: 'Указатель очереди перемещён на выбранный элемент',
                    components: [],
                    ephemeral: true
                })
                collector.stop()
            }
        })

        collector.on('end', collected => {
            console.log('Сборщик команды queue to остановлен')
        })

    } else if (interaction.options.getSubcommand() === 'delete') {

        const queueItems = player.queue('get')
        const current = player.queue('current')

        if (!queueItems.length) {
            return interaction.editReply({content: 'В очереди ничего нет', ephemeral: true})
        }

        const selectRow = makeQueueSelect('queue-delete-select', queueItems, {current, multiselect: true})

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('queue-back-btn')
                    .setLabel('Назад')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('queue-delete-btn')
                    .setLabel('Удалить')
                    .setStyle(ButtonStyle.Danger)
            )

        interaction.editReply({components: [selectRow], ephemeral: true})

        const message = await interaction.fetchReply()
        const collector = message.createMessageComponentCollector({time: 900000})

        let selectedIndexes = null

        collector.on('collect', async i => {
            if (i.customId === 'queue-delete-select') {
                selectedIndexes = i.values.map(value => +value.replace(/\..+/, '') - 1)
                const embedFields = selectedIndexes.map(i => {
                    const pretty = queueItems[i].getPretty()
                    const isNext = (i) === current ? ' - следующий' : ''
                    return {
                        name: `${i + 1}. ${pretty.type}${isNext}`,
                        value: pretty.hyperlink
                    }
                })
                const embed = new EmbedBuilder()
                    .setTitle('Удалить?')
                    .setColor('#202225')
                    .addFields(...embedFields)
                i.update({embeds: [embed], components: [buttonRow], ephemeral: true})
            } else if (i.customId === 'queue-back-btn') {
                i.update({embeds: [], components: [selectRow], ephemeral: true})
            } else if (i.customId === 'queue-delete-btn') {
                await i.update({content: 'Элементы удаляются', embeds: [], components: [], ephemeral: true})
                await player.queue('delete', selectedIndexes)
                i.editReply({content: 'Элементы удалены', ephemeral: true})
                collector.stop()
            }
        })

        collector.on('end', collected => {
            console.log('Сборщик команды queue delete остановлен')
        })

    } else if (interaction.options.getSubcommand() === 'clear') {

        const queueItems = player.queue('get')
        const indexes = queueItems.map((item, i) => i)

        await interaction.editReply({content: 'Элементы удаляются', ephemeral: true})
        await player.queue('delete', indexes)
        interaction.editReply({content: 'Элементы удалены', ephemeral: true})

    }
}
