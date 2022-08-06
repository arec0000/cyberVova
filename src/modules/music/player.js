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
import Playlist from './playlist.js'

class Player extends EventEmitter {

    _state = 'disconnected'
    _loop = false

    _audioPlayer = null
    _voiceConnection = null
    _audioPlayerStateChangeHandler = () => {}

    currentTrack = {
        url: null,
        playlist: null
    }

    get state() {
        return this._state
    }

    get loop() {
        return this._loop
    }

    set loop(bool) {
        if (typeof bool === 'boolean') {
            this._loop = bool
        } else {
            throw new Error('Incorrect type for Player loop, it must be boolean')
        }
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
            this.disconnect()
        })
        this._setState('idle')
    }

    async defineTypeAndPlay(url) {
        const linkType = ytu.checkLinkType(url)
        if (!linkType) {
            return 'incorrectUrl'
        }
        if (linkType === 'video') {
            this.playTrack(url)
        } else {
            const listId = ytu.getPlaylistId(url)
            const playlistInfo = await yts({listId})
            const playlist = new Playlist('youtube', playlistInfo)
            if (linkType === 'videoFromPlaylist') {
                playlist.setCurrent(ytu.getVideoId(url))
            }
            this.playPlaylist(playlist)
        }
    }

    playTrack(url) {
        this._playUrl(url)
        this._setCurrentPlaylist(null)
        this._updateAudioPlayerStateChangeHandler((oldState, newState) => {
            if (newState.status === 'idle') {
                this.disconnect()
            }
        })
        this._setState('playing-single-track')
    }

    playPlaylist(playlist) {
        this._playUrl(playlist.next())
        this._setCurrentPlaylist(playlist)
        this._updateAudioPlayerStateChangeHandler((oldState, newState) => {
            if (newState.status === 'idle') {
                const songUrl = playlist.next()
                if (songUrl) {
                    this._playUrl(songUrl)
                } else {
                    if (this._loop) {
                        playlist.resetCurrent()
                        this._playUrl(playlist.next())
                    } else {
                        this.disconnect()
                    }
                }
            }
        })
        this._setState('playing-playlist')
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
