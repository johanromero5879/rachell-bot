import { pause } from '../player'

export const command = {
    run: async (client, message, args) => {
        pause( message )
    }
} 