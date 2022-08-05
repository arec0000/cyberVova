import ytu from '../helpers/yt-url.js'

class Playlist {

    current = 0
    loop = false

    constructor(playlistInfo) {
        this.title = playlistInfo.title
        this.videos = playlistInfo.videos.map(({title, videoId}) => ({
            title,
            id: videoId
        }))
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
        if (this.current < this.videos.length - 1) {
            return ytu.urlFromId({videoId: this.videos[this.current++].id})
        } else {
            return null
        }
    }

}

export default Playlist
