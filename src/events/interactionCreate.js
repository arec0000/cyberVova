export const name = 'interactionCreate'
export const once = false
export const execute = async interaction => {
    if (interaction.isChatInputCommand()) {
        console.log(`Получена команда ${interaction.commandName}`)
        const command = interaction.client.commands.get(interaction.commandName)
        if (!command) return
        try {
            await command.execute(interaction)
        } catch (e) {
            console.error(e)
            await interaction.reply({content: 'Ошибка при выполнении команды', ephemeral: true})
        }
    }
}
