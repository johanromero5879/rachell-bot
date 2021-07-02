import { setVolume } from '../player'
import { sendError, sendWithImage } from '../helpers/MessagesHandler'
import { getGif } from '../helpers/GifFetcher'

const limit = 75

export const command = {
    name: 'volume',
    group: 'music',
    description: 'Set volume of songs in queue.',
    run: async (client, message, args) => {

        const volume = parseFloat(args[0])

        if(isNaN(volume) || volume <= 0){
            return sendError(`Please input a number between 0 and ${ limit } following the command.`, message)
        }
        
        if( volume > limit ){
            const gifUrl = await getGif( 'miku pout', 1 )
            return sendWithImage( 'Do you want to break my ears? ヽ（≧□≦）ノ', gifUrl, message )
        }

        setVolume( volume, message )
    }
} 