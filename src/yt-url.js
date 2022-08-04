class YtUrl {
    checkLinkType = url => { //video playlist videoFromPlaylist (has weak validation)
        if (url.includes('playlist') && url.match(/list=[^&]+/)) {
            return 'playlist'
        }
        if (url.match(/v=[^&]+/) && url.match(/list=[^&]+/)) {
            return 'videoFromPlaylist'
        }
        if (url.match(/v=[^&]+/)) {
            return 'video'
        }
        return null
    }
    getPlaylistId = url => {
        return url.match(/list=[^&]+/)?.[0].replace('list=', '') || null
    }
    getVideoId = url => {
        return url.match(/v=[^&]+/)?.[0].replace('v=', '') || null
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
}

export default new YtUrl()
