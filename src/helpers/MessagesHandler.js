import { MessageEmbed } from 'discord.js'

export const sendError = ( description, message ) => {
    message.channel.send({
        embed: {
            description,
            color: 'BLACK'
        }
    })
}

export const sendWithImage = ( description, url, message ) => {
    const messageEmbed = new MessageEmbed()
        .setDescription(description)
        .setImage(url)
        .setColor(process.env.COLOR_BOT || "DEFAULT")
        
    message.channel.send(messageEmbed)
}