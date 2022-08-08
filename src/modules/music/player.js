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

class Player extends EventEmitter {

    _state = 'disconnected'

    _audioPlayer = null
    _voiceConnection = null
    _queue = new Queue()
    _audioPlayerStateChangeHandler = () => {}

    currentTrack = {
        url: null,
        playlist: null
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
            case 'delete':
                const task = this._queue.delete(payload)
                if (this._state === 'playing' && payload.includes(this._queue.current)) {
                    task.then(() => this._queueLoop())
                }
                return task
            case 'current':
                return this._queue.current
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
            this._playUrl(url)
            this._setCurrentPlaylist(null)
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
            this._playUrl(playlist.next())
            this._setCurrentPlaylist(playlist)
            this._updateAudioPlayerStateChangeHandler((oldState, newState) => {
                if (newState.status === 'idle') {
                    const songUrl = playlist.next()
                    if (songUrl) {
                        this._playUrl(songUrl)
                    } else {
                        if (playlist.loop) {
                            playlist.resetCurrent()
                            this._playUrl(playlist.next())
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
       this._audioPlayer.play(audio)
       this._setCurrentTrack(url)
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
