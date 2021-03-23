const { Client, MessageEmbed } = require('discord.js')
const bot = new Client({partials: ["REACTION", "USER", "CHANNEL"]})
const config = require('./config.json')

const prefix = "."
const logs_channel_id = "823583022594261072"
const color = "#2F3136"
const footer = "footer"

function sendLogs(log) {
    bot.channels.cache.get(logs_channel_id).send(new MessageEmbed().setDescription(log).setColor(color).setTimestamp())
}

bot.on("ready", () => {
    console.log("BOT online!");
})

bot.on("message", async message => {
    if (message.author.bot || !message.content.startsWith(prefix) || !message.guild) return

    let args = message.content.slice(prefix.length).trim().split(/ +/)
    let cmd = args.shift().toLowerCase()

    if (cmd == "anuncio") {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.delete()
        if (args.length < 2) return message.reply("você precisa escolher um canal e uma mensagem para enviar um anúncio")
        let canal = message.mentions.channels.first()
        if (!canal) return message.reply("você precisa escolher um canal para enviar um anúncio")
        let msg = args.slice(1).join(" ")
        canal.send(new MessageEmbed()
        .setTitle("🎉 ANÚNCIO ")
        .setDescription(msg)
        .setColor(color)
        .setFooter(footer, bot.user.displayAvatarURL())
        .setTimestamp()
        )
        sendLogs(`<@${message.member.id}> enviou um anúncio em ${canal}`)

    }

})

bot.login(config.token)