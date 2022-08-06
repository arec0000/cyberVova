import { Client, GatewayIntentBits } from 'discord.js'
import config from './config.json' assert {type: 'json'}
import createCommandsMap from './createCommandsMap.js'
import deployCommands from './services/deployCommands.js'
import addEventHandlers from './addEventHandlers.js'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
})

createCommandsMap(client)
    .then(deployCommands)
addEventHandlers(client)

client.login(config.token)
