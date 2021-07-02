import { pause } from '../player'

export const command = {
    name: 'pause',
    group: 'music',
    description: 'Pause current song playing in queue.',
    run: async (client, message, args) => {
        pause( message )
    }
} 