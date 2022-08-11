import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} from 'discord.js'

class MessageSender {

    constructor(guild) {
        this._block((async () => {
            const channelsMap = await guild.channels.fetch()
            const channels = Array.from(channelsMap.values())
            this.channel = channels.find(channel => channel.name === 'musichub')
        })())
    }

    _isBlocked = false
    _blockingTask = null

    async newTrack(url, playlist, player) {

        const playlistUrl = playlist?.type === 'youtube' ? `\nПлейлист\n${playlist.youtube.url}` : ''

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('play-dora')
                    .setLabel('Включите лучше дору')
                    .setStyle(ButtonStyle.Danger)
            )

        const message = await this.send({
            content: `Трек\n${url}${playlistUrl}`,
            components: [row]
        })

        const collector = message.createMessageComponentCollector({componentType: ComponentType.Button})

        collector.on('collect', i => {
            if (i.customId === 'play-dora') {
                player._playUrl('https://youtu.be/WNadEfGnV04')
                i.update({content: 'Ладно', components: []})
                collector.stop()
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
        if (!this._isBlocked) {
            return this.channel.send(message)
        } else {
            return this._blockingTask.then(() => this.channel.send(message))
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
