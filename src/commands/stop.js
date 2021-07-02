import { stop } from '../player'

export const command = {
    name: 'stop',
    group: 'music',
    description: 'Stop playing song in queue.',
    run: async (client, message, args) => {
        stop( message )
    }
} 