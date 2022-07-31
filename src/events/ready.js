export const name = 'ready'
export const once = true
export const execute = client => {
    console.log(`bot is ready tag: ${client.user.tag}`)
}