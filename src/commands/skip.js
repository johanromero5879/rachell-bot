import { skip } from '../player'

export const command = {
    name: 'skip',
    group: 'music',
    description: 'Skip next song in queue.',
    run: async (client, message, args) => {
        skip( message )
    }
} 