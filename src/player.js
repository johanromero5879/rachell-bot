import { MessageEmbed } from 'discord.js'
import ytdl from 'ytdl-core-discord'

import { formatSeconds } from './helpers/DateFormater'
import { sendError } from './helpers/MessagesHandler'


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
        message.client.queue.delete( message.guild.id )
        return
    }

    // Get audio stream
    const stream = await ytdl( song.url, { filter: 'audioonly' } )

    // Join bot to a voice channel
    const connection = await message.member.voice.channel.join() 

    // Play song
    const dispatcher = connection.play(stream, { type: 'opus' })
    dispatcher.on('finish', () => {
        queue.controlPanel?.delete()

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
    handleControlPanel( queue.controlPanel )
}

const handleControlPanel = async ( controlPanel ) => {    
    await controlPanel.react("⏹")
    await controlPanel.react("🔁")
    await controlPanel.react("⏯️")
    await controlPanel.react("⏩")
}

export const skip = async ( message ) => {
    if( !message.member.voice.channel ) 
        return sendError('Please connect to a voice channel.', message)

    const queue = message.client.queue.get( message.guild.id )

    if( !queue )
        return sendError('There is nothing in the queue right now.', message)
        
    if( queue.songs.length !==  0){
        queue.songs.shift()
        if( queue.songs.length !== 0 )
            queue.textChannel.send("⏩ Song has been skipped")

        play( queue.songs[0], message )
    }
}

export const pause = async ( message ) => {
    if( !message.member.voice.channel ) 
        return sendError('Please connect to a voice channel.', message)

    const queue = message.client.queue.get( message.guild.id )

    if( !queue )
        return sendError('There is nothing playing right now to pause.', message)

    if( queue.playing ){
        queue.playing = false
        queue.connection.dispatcher.pause()
        queue.textChannel.send("⏸ Song has been paused")
    }
}

export const resume = async ( message ) => {
    if( !message.member.voice.channel ) 
        return sendError('Please connect to a voice channel.', message)

    const queue = message.client.queue.get( message.guild.id )

    if( !queue )
        return sendError('There is nothing playing right now to pause.', message)

    if( !queue.playing ){
        queue.playing = true
        queue.connection.dispatcher.resume()
        queue.textChannel.send("▶️ Song has been resumed")
    }
}

export const setVolume = async ( volume, message ) => {
    if( !message.member.voice.channel ) 
        return sendError('Please connect to a voice channel.', message)

    const queue = message.client.queue.get( message.guild.id )

    if( !queue )
        return sendError('There is nothing playing right now to set volume.', message)

    queue.volume = Math.round(volume * 100) / 100
    queue.connection.dispatcher.setVolume(queue.volume / 100)
    queue.textChannel.send(`🔊 Current volume is ${queue.volume}%`)
}

export const loop = async ( message ) => {

    if( !message.member.voice.channel ) 
        return sendError('Please connect to a voice channel.', message)

    const queue = message.client.queue.get( message.guild.id )

    if( !queue )
        return sendError('There is nothing playing right now to toogle loop.', message)

    queue.loop = !queue.loop
    queue.textChannel.send(`🔁 Loop is now ${queue.loop ? "on" : "off"}`)
}

export const stop = async ( message ) => {
    if( !message.member.voice.channel ) 
        return sendError('Please connect to a voice channel.', message)

    const queue = message.client.queue.get( message.guild.id )

    if( !queue )
        return sendError('There is nothing playing right now to stop.', message)
    
    // Leave voice channel and delete queue map from guild
    queue.voiceChannel.leave()
    queue.textChannel.send("⏹ Queue has stopped")
    message.client.queue.delete( message.guild.id )

    
}