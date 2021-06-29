import { resume } from '../player'

export const command = {
    run: async (client, message, args) => {
        resume( message )
    }
} 