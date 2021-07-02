import { MessageEmbed } from 'discord.js'

export const getEmbedWithImage = ( description, url ) => {
    return new MessageEmbed()
        .setDescription(description)
        .setImage(url)
        .setColor(process.env.COLOR_BOT || "DEFAULT")
}