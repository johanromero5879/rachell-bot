import { join } from 'path'
import { readdirSync } from 'fs'
import { Client, Collection } from 'discord.js'
import 'discord-reply'

const prefix = process.env.PREFIX || '!'
const client = new Client()

// Create queue inside bot
client.queue = new Map()

// Getting all commands and save them in a collection map
client.commands = new Collection()

const files = readdirSync( join(__dirname, 'commands') )
for (const file of files) {
    if( !file.endsWith('.js') ) break
    const { command } = require(`./commands/${ file }`)
    const commandName = file.split('.')[0]

    client.commands.set( commandName, command )
}


client.on('message', async (message) => {
    // Ignore all script if message doesn't come from a guild, not start with prefix or author is a bot
    if (!message.guild || !message.content.startsWith(prefix) || message.author.bot) return

    // Extract arguments from command
    const args = message.content.slice(prefix.length).split(/ +/)

    // Get command name from arguments array
    const cmd = args.shift().toLocaleLowerCase()

    // Handle commands
    const command = client.commands.get( cmd )

    if( !command ) 
        return message.lineReplyNoMention(`**${ cmd }** command not found`)

    await command.run(client, message, args)
})

client.on('ready', () => {
    console.log(`Bot is up as ${ client.user.tag }`)
})

export default async () => {
    await client.login( process.env.BOT_TOKEN )
}