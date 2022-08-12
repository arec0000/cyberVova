import EventEmitter from 'events'
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    VoiceConnectionStatus
} from '@discordjs/voice'
import ytdl from 'ytdl-core'
import yts from 'yt-search'
import ytu from '../../helpers/yt-url.js'
import Queue from './queue.js'
import Playlist from './playlist.js'
import MessageSender from './messageSender.js'

class Player extends EventEmitter {

    _state = 'disconnected'

    _audioPlayer = null
    _audioStream = null
    _voiceConnection = null
    _queue = new Queue()
    _audioPlayerStateChangeHandler = () => {}

    currentTrack = {
        url: null,
        playlist: null
    }

    constructor(guild) {
        super()
        this.messageSender = new MessageSender(guild)
    }

    get state() {
        return this._state
    }

    connectToChannel(voiceChannel) {
        this._audioPlayer = createAudioPlayer()
        this._voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        })
        this._voiceConnection.subscribe(this._audioPlayer)
        this._voiceConnection.on(VoiceConnectionStatus.Disconnected, () => {
            if (this._state === 'playing' || this._state === 'idle') {
                this.disconnect()
            }
        })
        this._setState('idle')
    }

    queue(action, payload) {
        switch (action) {
            case 'play':
                if (this._queue.length) {
                    this._queueLoop()
                } else {
                    return 'queueIsEmpty'
                }
                break
            case 'get':
                    return this._queue.getList()
            case 'push':
                this._queue.push(payload)
                break
            case 'pushAfterCurrent':
                this._queue.pushAfterCurrent(payload)
                this._queueLoop()
                break
            case 'to':
                this._queue.setCurrent(payload)
                if (this._state === 'playing') {
                    this._queueLoop()
                }
                break
            case 'delete':
                const current = this._queue.current
                const task = this._queue.delete(payload)
                if (this._state === 'playing' && payload.includes(current - 1)) {
                    task.then(() => this._queueLoop())
                }
                return task
            case 'current':
                return this._queue.current
            case 'startedItem':
                return this._queue.getStartedItem()
            case 'loop':
                this._queue.loop = payload
                break
            case 'shuffle':
                this._queue.shuffle()
                if (this._state === 'playing') {
                    this._queueLoop()
                }
                break
        }
    }

    async defineTypeAndPlay(url) {
        const linkType = ytu.checkLinkType(url)
        if (!linkType) {
            return 'incorrectUrl'
        }
        if (linkType === 'video') {
            return this.playTrack(url)
        } else {
            const playlist = await this._ytPlalistFromUrl(url, linkType)
            return this.playPlaylist(playlist)
        }
    }

    playTrack(url) {
        return new Promise((resolve, reject) => {
            this._setCurrentPlaylist(null)
            this._announceAndPlay(url)
            this._updateAudioPlayerStateChangeHandler((oldState, newState) => {
                if (newState.status === 'idle') {
                    resolve()
                    this._setState('idle')
                }
            })
            this._setState('playing')
        })
    }

    playPlaylist(playlist) {
        return new Promise((resolve, reject) => {
            this._setCurrentPlaylist(playlist)
            this._announceAndPlay(playlist.next())
            this._updateAudioPlayerStateChangeHandler((oldState, newState) => {
                if (newState.status === 'idle') {
                    const songUrl = playlist.next()
                    if (songUrl) {
                        this._announceAndPlay(songUrl)
                    } else {
                        if (playlist.loop) {
                            playlist.resetCurrent()
                            this._announceAndPlay(playlist.next())
                        } else {
                            resolve()
                            this._setState('idle')
                        }
                    }
                }
            })
            this._setState('playing')
        })
    }

    next() {
        if (this._state !== 'playing') return
        if (!this.currentTrack.playlist) {
            this._queueLoop()
        } else {
            this._audioPlayerStateChangeHandler('', {status: 'idle'})
        }
    }

    back() {
        if (this._state !== 'playing') return
        const playlist = this.currentTrack.playlist
        if (!playlist) {
            const index = this._queue.current - 2
            this._queue.current = index >= 0 ? index : this._queue.length - 1
            this._queueLoop()
        } else {
            const playlistIndex = playlist.current - 2
            if (playlistIndex >= 0) {
                playlist.current = playlistIndex
                this._audioPlayerStateChangeHandler('', {status: 'idle'})
            } else {
                const queueIndex = this._queue.current - 2
                this._queue.current = queueIndex >= 0 ? queueIndex : this._queue.length - 1
                this._queueLoop()
            }
        }
    }

    pause() {
        this._audioPlayer.pause()
        this._setState('paused')
    }

    unpause() {
        this._audioPlayer.unpause()
        this._setState('playing')
    }

    disconnect() {
        this._audioPlayer.stop()
        this._voiceConnection.destroy()
        this._audioPlayer = null
        this._voiceConnection = null
        this._setCurrentTrack(null)
        this._setCurrentPlaylist(null)
        this._setState('disconnected')
    }

    _queueLoop = async () => {
        const url = await this._queue.next()
        if (url) {
            this.defineTypeAndPlay(url).then(this._queueLoop)
        } else {
            if (this._queue.loop) {
                this._queue.resetCurrent()
                this._queueLoop()
            } else {
                this.disconnect()
            }
        }
    }

    _announceAndPlay(url) {
        this._playUrl(url)
        this._announceNewTrack(url)
    }

    _playUrl(url) {
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
       this._audioStream = this._audioPlayer.play(audio)
       this._setCurrentTrack(url)
    }

    _announceNewTrack(url) {
        this.emit('newTrack')
        this.messageSender.newTrack(url, this.currentTrack.playlist, this)
    }

    async _ytPlalistFromUrl(url, linkType) {
        const listId = ytu.getPlaylistId(url)
        const playlistInfo = await yts({listId})
        const playlist = new Playlist('youtube', playlistInfo)
        if (linkType === 'videoFromPlaylist') {
            playlist.setCurrent(ytu.getVideoId(url))
        }
        return playlist
    }

    _setCurrentTrack(url) {
        this.currentTrack.url = url
    }

    _setCurrentPlaylist(playlist) {
        this.currentTrack.playlist = playlist
    }

    _setState(newState, ...args) {
        this.emit('stateChange', newState, ...args)
        this._state = newState
    }

    _updateAudioPlayerStateChangeHandler(newHandler) {
        this._audioPlayer.removeListener('stateChange', this._audioPlayerStateChangeHandler)
        this._audioPlayerStateChangeHandler = newHandler
        this._audioPlayer.on('stateChange', this._audioPlayerStateChangeHandler)
    }

}

export default Player
