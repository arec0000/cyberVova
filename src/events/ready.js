export const name = 'ready'
export const once = true
export const execute = client => {
    client.players = {}
    console.log(`Бот запущен тег: ${client.user.tag}`)
}
