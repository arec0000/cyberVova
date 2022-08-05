import EventEmitter from 'events'
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    VoiceConnectionStatus
} from '@discordjs/voice'
import ytdl from 'ytdl-core'

class Player extends EventEmitter {

    state = 'disconnected'
    audioPlayer = null
    voiceConnection = null
    audioPlayerStateChangeHandler = null
    loop = false

    connectToChannel(voiceChannel) {
        this.audioPlayer = createAudioPlayer()
        this.voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        })
        this.voiceConnection.subscribe(this.audioPlayer)
        this._changeState('idle')
        this.voiceConnection.on(VoiceConnectionStatus.Disconnected, () => {
            this.disconnect()
        })
    }

    playTrack(url) {
        this._playUrl(url)
        this.audioPlayerStateChangeHandler = (oldState, newState) => {
            if (newState.status === 'idle') {
                this.disconnect()
            }
        }
        this.audioPlayer.removeAllListeners('stateChange')
        this.audioPlayer.on('stateChange', this.audioPlayerStateChangeHandler)
        this._changeState('playing-single-track')
    }

    playPlaylist(playlistInst) {
        this._playUrl(playlistInst.next())
        this.audioPlayerStateChangeHandler = (oldState, newState) => {
            if (newState.status === 'idle') {
                const songUrl = playlistInst.next()
                if (songUrl) {
                    this._playUrl(songUrl)
                } else {
                    if (this.loop) {
                        playlistInst.resetCurrent()
                        this._playUrl(playlistInst.next())
                    } else {
                        this.disconnect()
                    }
                }
            }
        }
        this.audioPlayer.removeAllListeners('stateChange')
        this.audioPlayer.on('stateChange', this.audioPlayerStateChangeHandler)
        this._changeState('playing-playlist')
    }

    setLoop(bool) {
        this.loop = bool
    }

    disconnect() {
        this.audioPlayer.removeAllListeners('stateChange')
        this.audioPlayer.stop()
        this.voiceConnection.destroy()
        this.audioPlayer = null
        this.voiceConnection = null
        this._changeState('disconnected')
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
       this.audioPlayer.play(audio)
    }

    _changeState(newState) {
        this.emit('stateChange', newState)
        this.state = newState
    }

}

export default Player
