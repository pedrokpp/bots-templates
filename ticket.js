const { Client, MessageEmbed } = require('discord.js')
const bot = new Client({partials: ["REACTION", "USER", "CHANNEL"]})

const prefix = "."
const ticket_channel_id = ""
const logs_channel_id = ""
const color = "#2F3136"
const footer = "footer"
const emoji = '🎟️'

let inTicket = ["by kp#3343"]

function sendLogs(log) {
    bot.channels.cache.get(logs_channel_id).send(new MessageEmbed().setDescription(log).setColor(color).setTimestamp())
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function estanaArray(array, id) {
    const index = array.indexOf(id)
    if (index > -1) {
        return true
    } else {
        // Para adicionar à array: array.push(id)
        return false
    }
}

function removerdaArray(array, id) {
    const index = array.indexOf(id)
    if (index > -1) {
        array.splice(index, 1)
    }
}

bot.on("ready", () => {
    console.log("BOT online!");
})

bot.on("message", async message => {
    if (message.author.bot || !message.content.startsWith(prefix) || !message.guild) return

    let args = message.content.slice(prefix.length).trim().split(/ +/)
    let cmd = args.shift().toLowerCase()

    if (cmd == "ticket-setup") {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.delete()
        let canal = message.mentions.channels.first()
        message.reply(`canal de tickets setado em: ${canal}`)
        let tick_embed = await canal.send(new MessageEmbed()
            .setTitle("Título da Embed")
            .setDescription("Descrição da Embed")
            .setColor(color)
            .setFooter(footer, bot.user.displayAvatarURL())
        )
        tick_embed.react(emoji)
    }
})

bot.on("messageReactionAdd", async (reaction, user) => {
    if (user.partial) await user.fetch()
    if (reaction.partial) await reaction.fetch()
    if (reaction.message.partial) await reaction.message.fetch()

    if (user.bot) return

    if (reaction.message.channel.name.includes('ticket-') && reaction.emoji.name == "🔒") {
        reaction.message.channel.send(new MessageEmbed()
            .setAuthor(`Ticket fechado por ${user.username}`, user.displayAvatarURL())
            .setDescription("Esse canal será deletado em 5 segundos!")
            .setColor(color)
            .setFooter(footer, bot.user.displayAvatarURL())
        )

        setTimeout(() => {
            try {
                removerdaArray(inTicket, reaction.message.channel.topic)
                sendLogs(`\`\`${reaction.message.channel.name}\`\`, criado por <@${reaction.message.channel.topic}> foi fechado por <@${user.id}>`)
                reaction.message.channel.delete()
            } catch (error) {
                console.log(`Houve um erro ao deletar o ticket ${reaction.message.channel.name} :: ${error}`);
                sendLogs(`Houve um erro ao deletar o ticket \`\`${reaction.message.channel.name}\`\` , cheque o console`)
            }

        }, 5000)
    }

    if (reaction.message.channel.id == ticket_channel_id && reaction.emoji.name == emoji) {
        if (estanaArray(inTicket, user.id)) { 
            let x = await user.send("Você já possui um ticket aberto, aguarde o encerramento do atual para abrir outro")
            x.delete({timeout:9000})
            return
        }
        inTicket.push(user.id)
        reaction.message.guild.channels.create(`ticket-${getRandomInt(1111, 9999)}`, {
            permissionOverwrites: [
                {
                    id: reaction.message.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                /*{
                    id: "id do cargo que poderá ver os tickets",
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },*/
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                }
            ],
            type: 'text'/*,
            parent: 'id da categoria que o ticket será criado'*/
        }).then(async channel => {
            reaction.users.remove(user.id)
            channel.setTopic(`${user.id}`)
            let emb = await channel.send(`<@${user.id}>`,
                new MessageEmbed()
                    .setTitle("Ticket aberto!")
                    .setDescription(`Aguarde pacientemente por uma resposta, não demoramos para responder!\n\nEnquanto isso, sinta-se livre para nos falar mais sobre o que precisa. :)`)
                    .setColor(color)
                    .setFooter(footer, bot.user.displayAvatarURL()))
            setTimeout(() => {
                emb.react('🔒')
            }, 2000)
        })
    }
})

bot.login("")