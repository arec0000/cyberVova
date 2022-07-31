import { Routes } from 'discord.js'
import { REST } from '@discordjs/rest'
import config from './config.json' assert {type: 'json'}

const rest = new REST({version: '10'}).setToken(config.token)

const deployCommands = async commands => {
    const commandsJSON = commands.map(({data}) => data.toJSON())
    try {
        await rest.put(Routes.applicationGuildCommands(config.applicationId, config.serverId), {
            body: commandsJSON
        })
    } catch (e) {
        console.error(e)
    }
}

export default deployCommands
