import { setVolume, validate } from '../player'
import { getEmbedWithImage } from '../helpers/MessagesHandler'
import { getGif } from '../helpers/GifFetcher'

const limit = 75

export const command = {
    name: 'volume',
    group: 'music',
    description: 'Set volume of songs in queue.',
    run: async (client, message, args) => {
        if( !validate( message ) ) return
        
        const volume = parseFloat(args[0])

        if(isNaN(volume) || volume <= 0){
            return message.lineReplyNoMention(`Please input a number between 0 and ${ limit } following the command.`)
        }
        
        if( volume > limit ){
            const gifUrl = await getGif( 'miku pout', 1 )
            const embed = getEmbedWithImage( 'Do you want to break my ears? ヽ（≧□≦）ノ', gifUrl )
            return message.lineReplyNoMention( embed )
        }

        setVolume( volume, message )
    }
} 