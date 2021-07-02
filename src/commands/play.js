import { Client } from 'youtubei'
import { play, addQueue } from '../player'

const youtube = new Client()

const hasPermissions = (client, message) => {
    const channel = message.member?.voice.channel
    const permissions = channel?.permissionsFor(client.user)

    if (!permissions) return false

    if (!permissions.has('CONNECT')){
        message.lineReplyNoMention("I don't have permissions to join the voice channel.")
        return false
    }

    if (!permissions.has('SPEAK')) {
        message.lineReplyNoMention("I don't have permissions to speak in the voice channel.")
        return false
    }

    return true
}

export const command = {
    name: 'play',
    group: 'music',
    description: "Start playing a song",
    run: async (client, message, args) => {
        let queue = message.client.queue.get( message.guild.id )

        // Check if author is on voice channel
        if( !message.member.voice.channel ) 
            return message.lineReplyNoMention('Please connect to a voice channel.')

        // Check if user is in same voice channel that bot
        if( queue && message.member.voice.channel.id !== queue.voiceChannel.id )
            return message.lineReplyNoMention("I'm comfy in other voice channel. I don't want to move from here.（︶^︶）")
        
        // Check permissions
        if(!hasPermissions(client, message)) return

        // Check if exists search
        if( !args[0] )
            return message.lineReplyNoMention('Please input an search following the command.')

        // Get video info
        
        const videoInfo = await youtube.findOne( args.join(' ') )
        if(!videoInfo)
            return message.lineReplyNoMention('Search not found.')

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
        queue = message.client.queue.get( message.guild.id )

        // Join to voice channel
        queue.connection = await message.member.voice.channel.join()

        // Start play
        if( queue.songs.length == 1 ){
            play( queue.songs[0], message )
        }
    }
}