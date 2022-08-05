class YtUrl {

    checkLinkType = url => { //video playlist videoFromPlaylist (has weak validation)
        if (url.includes('playlist') && url.match(/list=[^&]+/)) {
            return 'playlist'
        }
        if (url.match(/v=[^&]+/) && url.match(/list=[^&]+/)) {
            return 'videoFromPlaylist'
        }
        if (url.match(/v=[^&]+/) || url.includes('youtu.be')) {
            return 'video'
        }
        return null
    }

    getPlaylistId = url => {
        return url.match(/list=[^&]+/)?.[0].replace('list=', '') || null
    }

    getVideoId = url => {
        const defLinkId = url.match(/v=[^&]+/)?.[0].replace('v=', '')
        if (defLinkId) {
            return defLinkId
        }
        if (url.includes('youtu.be')) {
            return url.replace(/.+\.be\//, '')
        }
        return null
    }

    urlFromId = ({videoId, playlistId}) => {
        if (videoId && playlistId) {
            return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`
        } else if (videoId) {
            return `https://www.youtube.com/watch?v=${videoId}`
        } else if (playlistId) {
            return `https://www.youtube.com/playlist?list=${playlistId}`
        } else {
            throw new Error('Not enough arguments for urlFromId')
        }
    }

    getPlaylistUrl = url => {
        return this.urlFromId({playlistId: this.getPlaylistId(url)})
    }

}

export default new YtUrl()
