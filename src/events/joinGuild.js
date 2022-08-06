export const name = 'guildCreate'
export const once = false
export const execute = async guild => {
    console.log(`Бот добавлен на сервер: ${guild.name}`)
}
