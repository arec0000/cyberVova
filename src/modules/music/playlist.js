import ytu from '../../helpers/yt-url.js'

class Playlist {

    constructor(type, playlistInfo) {

        this.title = playlistInfo.title

        if (type === 'custom' || type === 'youtube') {
            this.type = type
        } else {
            throw new Error('Incorrect playlist type')
        }

        if (type === 'youtube' && playlistInfo.listId && playlistInfo.url) {
            this.youtube = {
                id: playlistInfo.listId,
                url: playlistInfo.url,
                thumbnail: playlistInfo.thumbnail
            }
        } else {
            throw new Error('Id and url is required for youtube playlist')
        }

        this.videos = playlistInfo.videos.map(({title, videoId, thumbnail}) => ({
            title,
            id: videoId,
            thumbnail
        }))

    }

    current = 0
    loop = false

    getStartedTrack() {
        if (this.current > 0) {
            return {...this.videos[this.current - 1]}
        } else {
            return null
        }
    }

    setCurrent(videoId) {
        const index = this.videos.findIndex(({id}) => id === videoId)
        if (index !== -1) {
            this.current = index
        } else {
            throw new Error('Video was not found in the specified playlist')
        }
    }

    resetCurrent() {
        this.current = 0
    }

    next() {
        if (this.current < this.videos.length) {
            return ytu.urlFromId({
                videoId: this.videos[this.current++].id,
                playlistId: this.youtube ? this.youtube.id : null
            })
        } else {
            return null
        }
    }

}

export default Playlist
