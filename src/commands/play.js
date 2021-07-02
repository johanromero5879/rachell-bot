import { Client } from 'youtubei'
import { sendError } from '../helpers/MessagesHandler'
import { play, addQueue } from '../player'

const youtube = new Client()

const hasPermissions = (client, message) => {
    const channel = message.member?.voice.channel
    const permissions = channel?.permissionsFor(client.user)

    if (!permissions) return false

    if (!permissions.has('CONNECT')){
        sendError("I don't have permissions to join the voice channel.", message)
        return false
    }

    if (!permissions.has('SPEAK')) {
        sendError("I don't have permissions to speak in the voice channel.", message)
        return false
    }

    return true
}

export const command = {
    name: 'play',
    group: 'music',
    description: "Start playing a song",
    run: async (client, message, args) => {
        // Check if author is on voice channel
        if( !message.member.voice.channel ) 
            return sendError('Please connect to a voice channel.', message)
        
        // Check permissions
        if(!hasPermissions(client, message)) return

        // Check if exists search
        if( !args[0] )
            return sendError('Please input an search following the command.', message)

        // Get video info
        
        const videoInfo = await youtube.findOne( args.join(' ') )
        if(!videoInfo)
            return sendError('Search not found.', message)

        const { id, title, thumbnails, duration } = videoInfo
        const url = `https://www.youtube.com/watch?v=${ id }`

        // Build song object
        const song = {
            id,
            title,
            url,
            thumbnail: thumbnails[0].url,
            requester: message.author,
            duration
        }

        // Add to queue
        addQueue( song, message )

        // Join to voice channel
        const queue = message.client.queue.get( message.guild.id )
        queue.connection = await message.member.voice.channel.join()

        // Start play
        if( queue.songs.length == 1 ){
            play( queue.songs[0], message )
        }
    }
}