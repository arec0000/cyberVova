import { Routes } from 'discord.js'
import { REST } from '@discordjs/rest'
import config from '../config.json' assert {type: 'json'}

const rest = new REST({version: '10'}).setToken(config.token)

const deployCommands = async (client, commands) => {
    const guilds = await client.guilds.fetch()
    if (!guilds) return
    const commandsJSON = commands.map(({data}) => data.toJSON())
    try {
        guilds.forEach(async ({id}) => {
            await rest.put(Routes.applicationGuildCommands(config.applicationId, id), {
                body: commandsJSON
            })
        })
    } catch (e) {
        console.error(e)
    }
}

export default deployCommands
