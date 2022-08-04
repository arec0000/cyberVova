import ytu from './yt-url.js'

class Playlist {
    constructor(playlistInfo, currentVideoId) {
        this.title = playlistInfo.title
        this.current = 0
        this.videos = playlistInfo.videos.map(({title, videoId}) => ({
            title,
            id: videoId
        }))
    }
    setCurrent(videoId) {
        const index = this.videos.findIndex(({id}) => id === videoId)
        if (index === -1) {
            throw new Error('Video was not found in the specified playlist')
        }
        this.current = index
    }
    next() {
        const index = this.current
        if (this.current < this.videos.length - 1) {
            this.current++
        } else {
            this.current = 0
        }
        return ytu.urlFromId({videoId: this.videos[index].id})
    }
}

export default Playlist
