export const sendError = ( description, message ) => {
    message.channel.send({
        embed: {
            description,
            color: 'BLACK'
        }
    })
}