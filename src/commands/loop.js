import { loop } from '../player'

export const command = {
    run: async (client, message, args) => {
        loop( message )
    }
} 