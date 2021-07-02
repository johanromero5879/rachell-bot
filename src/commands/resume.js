import { resume } from '../player'

export const command = {
    name: 'resume',
    group: 'music',
    description: 'Play current song again if this was paused.',
    run: async (client, message, args) => {
        resume( message )
    }
} 