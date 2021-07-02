import { MessageEmbed } from 'discord.js'
import ytdl from 'ytdl-core-discord'

import { formatSeconds } from './helpers/DateFormater'

export const validate = ( message ) => {
    // Check if author is on voice channel
    if( !message.member.voice.channel ){
        message.lineReplyNoMention('Please connect to a voice channel.')
        return false
    }

    const queue = message.client.queue.get( message.guild.id )

    // Chekc if queue exists in guild
    if( !queue ){
        message.lineReplyNoMention('There is nothing in queue.')
        return false
    }

    // Check if user is in same voice channel that bot
    if( message.member.voice.channel.id !== queue.voiceChannel.id ){
        message.lineReplyNoMention("You're not in same voice channel than me. o_o")
        return false
    }
    
    return true
}

export const addQueue = ( song, message ) => {
    let queue = message.client.queue.get( message.guild.id )

    if(!queue){
        queue = {
            textChannel: message.channel,
            voiceChannel: message.member.voice.channel,
            controlPanel: null,
            connection: null,
            songs: [],
            volume: 35,
            playing: true,
            loop: false
        }

        message.client.queue.set( message.guild.id, queue )
    }

    queue.songs.push( song )

    const addedMessage = new MessageEmbed()
        .setTitle("Added to queue")
        .setDescription(`[${song.title}](${song.url})`)
        .addField("Duration", `${formatSeconds(song.duration)}`, true)
        .addField("Position in queue", queue.songs.length, true)
        .setColor(process.env.COLOR_BOT || "DEFAULT")
        .setThumbnail(song.thumbnail)
        .setFooter(`Requested by ${song.requester.tag}`, song.requester.avatarURL())

    queue.textChannel.send( addedMessage )

}

export const play = async ( song, message ) => {
    const queue = message.client.queue.get( message.guild.id )

    if( !song ){
        queue.voiceChannel.leave()
        queue.textChannel.send("⏹ Queue has stopped")
        message.client.queue.delete( message.guild.id )
        return
    }

    // Get audio stream
    const stream = await ytdl( song.url, { filter: 'audioonly' } )

    // Join bot to a voice channel
    const connection = await message.member.voice.channel.join() 

    // Play song
    deleteControlPanel(message)
    const dispatcher = connection.play(stream, { type: 'opus' })
    dispatcher.on('finish', () => {
        deleteControlPanel(message)

        if(!queue.loop)
            queue.songs.shift()
        
        play(queue.songs[0], message)
    })

    dispatcher.setVolume(queue.volume / 100)

    // Message Embed
    const embed = new MessageEmbed()
        .setTitle("🎶 Now playing 🎶")
        .setDescription(`[${song.title}](${song.url})`)
        .addField('Duration', formatSeconds(song.duration), true)
        .setColor(process.env.COLOR_BOT || "DEFAULT")
        .setImage(song.thumbnail)
        .setFooter(`Requested by ${song.requester.tag}`, song.requester.avatarURL())

    queue.controlPanel = await queue.textChannel.send(embed)
    handleControlPanel( queue.controlPanel, message )
}

const handleControlPanel = async ( controlPanel, message ) => {    
    await controlPanel.react("⏹")
    await controlPanel.react("🔁")
    await controlPanel.react("⏯️")
    await controlPanel.react("⏩")

    // Collector to handle reactions events
    const filter = (reaction, user) => user.id !== message.client.user?.id

    const collector = controlPanel.createReactionCollector( filter )

    collector.on("collect", (reaction , user ) => {
        if (!validate(message)) {
            reaction.users.remove(user)
            return
        }

        const queue = message.client.queue.get( message.guild.id )

        switch (reaction.emoji.name) {
            case "⏹":
                collector.stop()
                stop(message)
                break
            case "🔁":
                loop(message)
                reaction.users.remove(user);
                break
            case "⏯️":
                if (queue.playing) {
                    pause(message)
                } else {
                    resume(message)
                }
                reaction.users.remove(user);
                break
            case "⏩":
                collector.stop()
                skip(message)
                break
            default:
                reaction.users.remove(user)
                break;
        }
    })
}

const deleteControlPanel = async ( message ) => {
    const queue = message.client.queue.get( message.guild.id )
    try{
        await queue.controlPanel?.delete()
    }catch(ex){
        // Nothing
    }
}

export const skip = async ( message ) => {

    if( !validate( message ) ) return

    const queue = message.client.queue.get( message.guild.id )
        
    if( queue.songs.length !==  0){
        queue.songs.shift()
        if( queue.songs.length !== 0 )
            queue.textChannel.send("⏩ Song has been skipped")

        play( queue.songs[0], message )
    }
}

export const pause = async ( message ) => {
    if( !validate( message ) ) return

    const queue = message.client.queue.get( message.guild.id )

    if( queue.playing ){
        queue.playing = false
        queue.connection.dispatcher.pause()
        queue.textChannel.send("⏸ Song has been paused")
    }
}

export const resume = async ( message ) => {
    if( !validate( message ) ) return

    const queue = message.client.queue.get( message.guild.id )

    if( !queue.playing ){
        queue.playing = true
        queue.connection.dispatcher.resume()
        queue.textChannel.send("▶️ Song has been resumed")
    }
}

export const setVolume = async ( volume, message ) => {
    const queue = message.client.queue.get( message.guild.id )

    queue.volume = Math.round(volume * 100) / 100
    queue.connection.dispatcher.setVolume(queue.volume / 100)
    queue.textChannel.send(`🔊 Current volume is ${queue.volume}%`)
}

export const loop = async ( message ) => {

    if( !validate( message ) ) return

    const queue = message.client.queue.get( message.guild.id )

    queue.loop = !queue.loop
    queue.textChannel.send(`🔁 Loop is now ${queue.loop ? "on" : "off"}`)
}

export const stop = async ( message ) => {
    if( !validate( message ) ) return

    const queue = message.client.queue.get( message.guild.id )
    
    // Leave voice channel and delete queue map from guild
    queue.voiceChannel.leave()
    queue.textChannel.send("⏹ Queue has stopped")
    message.client.queue.delete( message.guild.id )
}