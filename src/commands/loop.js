import { loop } from '../player'

export const command = {
    name: 'loop',
    group: 'music',
    description: 'Loop current song playing in queue.',
    run: async (client, message, args) => {
        loop( message )
    }
} 