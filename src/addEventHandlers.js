import fs from 'fs'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const eventsPath = path.join(__dirname, 'events')
const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

const addEventHandlers = async client => {
    for (const file of eventsFiles) {
        const filePath = path.join(eventsPath, file)
        const event = await import(`file://${filePath}`)
        client[event.once ? 'once' : 'on'](event.name, event.execute)
    }
}

export default addEventHandlers