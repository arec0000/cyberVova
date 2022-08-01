import {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js'
import config from './config.json' assert {type: 'json'}
import createCommandsMap from './createCommandsMap.js'
import deployCommands from './deployCommands.js'
import addEventHandlers from './addEventHandlers.js'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

createCommandsMap(client)
    .then(deployCommands)
addEventHandlers(client)

client.login(config.token)
