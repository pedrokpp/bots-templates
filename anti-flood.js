const { Client, MessageEmbed } = require('discord.js')
const bot = new Client({partials: ["REACTION", "USER", "CHANNEL"]})
const config = require('./config.json')

let messageMap = new Map()

bot.on("ready", () => {
    console.log("BOT online!");
})

bot.on("message", async message => {
    if (message.author.bot || !message.guild /*|| message.member.hasPermission("ADMINISTRATOR")*/) return

    let user = message.author

    if (messageMap.get(user.id) == null) return messageMap.set(user.id, message.content)

    if (messageMap.get(user.id) == message.content) {
        let x = await user.send("Você não pode mandar uma mensagem com o mesmo conteúdo mais de uma vez")
        messageMap.delete(user.id)
        message.delete()
        x.delete({timeout:9000})
        return
    }
    

})

bot.login(config.token)