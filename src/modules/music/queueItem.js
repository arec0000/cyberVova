import yts from 'yt-search'
import ytu from '../../helpers/yt-url.js'

class QueueItem {

    constructor(url) {
        const type = ytu.checkLinkType(url)
        if (type) {
            this.url = url
            this.type = type
        } else {
            this.type = 'incorrectUrl'
        }
    }

    async fetchTitle() {
        try {
            const {title} = this.type === 'video'
                ? await yts({videoId: ytu.getVideoId(this.url)})
                : await yts({listId: ytu.getPlaylistId(this.url)})
            this.title = title
            return title
        } catch (err) {
            throw err
        }
    }

    getPretty() {
        if (this.type !== 'incorrectUrl') {
            return {
                type: this.type === 'video' ? 'трек' : 'плейлист',
                hyperlink: `[${this.title}](${this.url})`
            }
        } else {
            throw new Error('Can\'t get prettyItem from incorrect queueItem')
        }
    }

}

export default QueueItem
