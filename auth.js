const { Client, MessageEmbed } = require('discord.js')
const bot = new Client({ partials: ["REACTION", "USER", "CHANNEL"] })
const config = require('./config.json')

const prefix = "."
const logs_channel_id = "823583022594261072"
const auth_channel_id = ""
const role_id = ""
const server_id = ""
const emoji = '🔓'
const color = "#2F3136"
const footer = "footer"

let auth_map = new Map()

function sendLogs(log) {
    bot.channels.cache.get(logs_channel_id).send(new MessageEmbed().setDescription(log).setColor(color).setTimestamp())
}

function getCaptcha(length) {
    let result = '';
    let chars = 'QWERTYUIOPASDFGHJKLÇZXCVBMqwertyuiopasdfghjklçzxcvbnm1234567890!@#$%&';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

bot.on("ready", () => {
    console.log("BOT online!");
})

bot.on("message", async message => {
    if (message.author.bot || !message.content.startsWith(prefix) || !message.guild) return

    let args = message.content.slice(prefix.length).trim().split(/ +/)
    let cmd = args.shift().toLowerCase()

    if (cmd == "auth-setup") {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.delete()
        let canal = message.mentions.channels.first()
        message.reply(`canal de autenticação setado em: ${canal}`)
        let auth_embed = await canal.send(new MessageEmbed()
            .setTitle("Título da Embed")
            .setDescription("Descrição da Embed")
            .setColor(color)
            .setFooter(footer, bot.user.displayAvatarURL())
        )
        auth_embed.react(emoji)
    }
})

bot.on("message", async message => {
    if (message.author.bot || message.guild || !auth_map.has(message.author.id)) return

    if (message.content == auth_map.get(message.author.id)) {
        let x = await message.channel.send("Código correto! Você foi autenticado com sucesso, agora pode acessar o servidor. :)")
        x.delete({timeout:9000})
        auth_map.delete(message.author.id)
        bot.guilds.cache.get(server_id).members.cache.get(message.author.id).roles.add(role_id)
        sendLogs(`<@${message.author.id}> se autenticou com sucesso, cargo <@&${role_id}> adicionado`)
    }
})

bot.on("messageReactionAdd", async (reaction, user) => {
    if (user.partial) await user.fetch()
    if (reaction.partial) await reaction.fetch()
    if (reaction.message.partial) await reaction.message.fetch()

    if (user.bot) return

    if (reaction.message.channel.id == auth_channel_id && reaction.emoji.name == emoji) {
        auth_map.set(user.id, getCaptcha(5))
        let x = await user.send(new MessageEmbed()
        .setTitle("🔓 Sistema de autenticação")
        .setDescription(`Digite exatamente essa sequência de caracteres: \`\`${auth_map.get(user.id)}\`\``)
        .setColor(color)
        .setFooter(footer, bot.user.displayAvatarURL())
        .setTimestamp()
        )
        reaction.users.remove(user.id)
        x.delete({timeout:15000})
    }
})

bot.login(config.token)