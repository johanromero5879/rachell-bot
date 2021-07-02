export const command = {
    name: 'hi',
    group: 'fun',
    description: 'Greetings with a gif to everyone or a member from guild.',
    run: (client, message, args) => {
        message.reply('Hi dear!')
    }
} 