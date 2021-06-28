export const command = {
    run: async (client, message, args) => {
        if(!message.guild) return 

        if(message.member.hasPermission("ADMINISTRATOR")){
            try{
                const messages = await message.channel.messages.fetch()
 
                await message.channel.bulkDelete(messages)
            }catch(ex){
                message.channel.send("Can only delete messages that are under 14 days old.")
            }
        }else{
            message.channel.send("You don't have permissions to use this command.")
        }
    }
} 