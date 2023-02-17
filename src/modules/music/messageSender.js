import {
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} from 'discord.js'

class MessageSender {

    _isBlocked = false
    _blockingTask = null

    constructor(guild) { // это лучше переписать, на отдельный метод инициализации
        this._block((async () => {
            const channelsMap = await guild.channels.fetch()
            const channels = Array.from(channelsMap.values())
            this.channel = channels.find(channel => channel.name === 'musichub')
        })())
    }

    async newTrack(url, playlist, player) {

        const embeds = [new EmbedBuilder()
            .setColor('#FF0000')
            .setURL(url)]

        if (!playlist) {

            const {title, thumbnail} = player.queue('startedItem')
            embeds[0].setTitle(title).setImage(thumbnail)

        } else if (playlist.type === 'youtube') {

            const {title, thumbnail} = playlist.getStartedTrack()

            embeds[0].setTitle(title).setImage(thumbnail)

            embeds.push(new EmbedBuilder().setTitle(playlist.title)
                .setColor('#202225')
                .setURL(playlist.youtube.url)
                .setThumbnail(playlist.youtube.thumbnail)
                .setDescription('Плейлист')
            )
        }

        const rows = this._createRows()

        const components = []

        if (!playlist) {
            components.push(rows.singleTrack)
        } else {
            if (playlist.loop) {
                components.push(rows.stopLoop)
            } else {
                components.push(rows.setLoop)
            }
        }

        const message = await this.send({embeds, components})

        const collector = message.createMessageComponentCollector({componentType: ComponentType.Button})

        collector.on('collect', i => {
            if (i.customId === 'play-dora') {
                /// это нужно переписать, в принципе стоит сделать создание кастомных кнопок
                if (player.state === 'disconnected') {
                    const voiceChannel = i.member.voice.channel
                    if (!voiceChannel) {
                        return i.reply({content: 'Подключитесь к голосовому каналу', ephemeral: true})
                    }
                    player.connectToChannel(voiceChannel)
                }
                ///
                player.playTrackOutOfQueue('https://youtu.be/WNadEfGnV04')
                i.update({content: 'Ладно', embeds: [], components: []})
                collector.stop()
            } else if (i.customId === 'next') {
                player.next()
            } else if (i.customId === 'back') {
                player.back()
            } else if (i.customId === 'loop') {
                playlist.loop = true
                i.update({components: [rows.stopLoop]})
            } else if (i.customId === 'stop-loop') {
                playlist.loop = false
                i.update({components: [rows.setLoop]})
            }
            console.log(`Нажата кнопка ${i.customId}`)
        })

        collector.on('end', collected => {
            console.log('Сборщик команды сообщения о песне остановлен')
        })

        player.once('newTrack', () => {
            message.edit({components: []})
            collector.stop()
        })

    }

    send(message) {
        if (!this.channel) return
        if (!this._isBlocked) {
            return this.channel.send(message)
        } else {
            return this._blockingTask.then(() => this.channel.send(message))
        }
    }

    _createRows() {
        const back = new ButtonBuilder()
            .setCustomId('back')
            .setLabel('←')
            .setStyle(ButtonStyle.Secondary)

        const next = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('→')
            .setStyle(ButtonStyle.Secondary)

        const loop = new ButtonBuilder()
            .setCustomId('loop')
            .setLabel('Не зациклен')
            .setStyle(ButtonStyle.Secondary)

        const stopLoop = new ButtonBuilder()
            .setCustomId('stop-loop')
            .setLabel('Зациклен')
            .setStyle(ButtonStyle.Secondary)

        const dora = new ButtonBuilder()
            .setCustomId('play-dora')
            .setLabel('Включите лучше дору')
            .setStyle(ButtonStyle.Danger)

        return {
            singleTrack: new ActionRowBuilder()
                .addComponents(back, next, dora),
            setLoop: new ActionRowBuilder()
                .addComponents(back, next, loop, dora),
            stopLoop: new ActionRowBuilder()
                .addComponents(back, next, stopLoop, dora)
        }
    }

    _block(promise) {
        this._isBlocked = true
        this._blockingTask = promise
        promise.then(() => {
            this._isBlocked = false
            this._blockingTask = null
        })
        return promise
    }

}

export default MessageSender
