import yts from 'yt-search'
import ytu from './yt-url.js'

const getLinkInfo = async url => {
        const type = ytu.checkLinkType(url)
        if (!type) {
            return 'incorrectUrl'
        }
        try {
            const {title} = type === 'video'
                ? await yts({videoId: ytu.getVideoId(url)})
                : await yts({listId: ytu.getPlaylistId(url)})
            return {
                title,
                url,
                type
            }
        } catch (err) {
            throw err
        }
}

export default getLinkInfo
