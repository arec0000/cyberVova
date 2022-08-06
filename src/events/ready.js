export const name = 'ready'
export const once = true
export const execute = client => {
    console.log(`Бот запущен тег: ${client.user.tag}`)
}
