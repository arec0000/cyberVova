import fs from 'fs'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { Collection } from 'discord.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const createCommandsMap = async client => {
    const commandsPath = path.join(__dirname, 'commands')
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    client.commands = new Collection()
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = await import(`file://${filePath}`)
        client.commands.set(command.data.name, command)
    }
    return Array.from(client.commands.values())
}

export default createCommandsMap