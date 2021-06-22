import { Client } from 'discord.js'
const client = new Client()

const prefix = '!'

client.on('message', message => {
    // Ignore all script if message doesn't start with prefix or author is a bot
    if (!message.content.startsWith(prefix) || message.author.bot) return

    // Extract arguments from command
    const args = message.content.slice(prefix.length).split(/ +/)

    // Get command name from arguments array
    const cmd = args.shift().toLocaleLowerCase()

    // Handle commands
    try{
        const { command } = require(`./commands/${ cmd }.js`)
        command.run(client, message, args)
    }catch(ex){
        console.error(ex.message)
        message.reply(`**${ cmd }** command not found`)
    }
})

client.on('ready', () => {
    console.log(`Bot is up as ${ client.user.tag }`)
})

export default async () => {
    await client.login( process.env.BOT_TOKEN )
}