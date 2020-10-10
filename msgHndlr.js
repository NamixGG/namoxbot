const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
const axios = require('axios')
const moment = require('moment-timezone')
const get = require('got')
const color = require('./lib/color')
const { spawn, exec } = require('child_process')
const nhentai = require('nhentai-js')
const { API } = require('nhentai-api')
const { liriklagu, quotemaker, randomNimek, fb, sleep, jadwalTv, ss } = require('./lib/functions')
const { help, snk, info, donate, readme, listChannel } = require('./lib/help')
const { stdout } = require('process')
const nsfw_ = JSON.parse(fs.readFileSync('./lib/NSFW.json'))
const welkom = JSON.parse(fs.readFileSync('./lib/welcome.json'))

moment.tz.setDefault('Asia/Jakarta').locale('id')

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName } = sender
        pushname = pushname || verifiedName
        const commands = caption || body || ''
        const command = commands.toLowerCase().split(' ')[0] || ''
        const args =  commands.split(' ')

        const msgs = (message) => {
            if (command.startsWith('!')) {
                if (message.length >= 10){
                    return `${message.substr(0, 15)}`
                }else{
                    return `${message}`
                }
            }
        }

        const mess = {
            wait: 'Processando.....',
            error: {
                St: '[❗] Erro',
                Qm: '[❗] Terjadi kesalahan, mungkin themenya tidak tersedia!',
                Yt3: '[❗] Terjadi kesalahan, tidak dapat meng konversi ke mp3!',
                Yt4: '[❗] Terjadi kesalahan, mungkin error di sebabkan oleh sistem.',
                Ig: '[❗] Midia esta em uma conta privada',
                Ki: '[❗] Bot tidak bisa mengeluarkan admin group!',
                Ad: '[❗] Ti ak dapat menambahkan target, mungkin karena di private',
                Iv: '[❗] Link não é do instagram!'
            }
        }

        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const botNumber = await client.getHostNumber()
        const blockNumber = await client.getBlockedIds()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const ownerNumber = '5512992025029'
        const isOwner = sender.id === sender.id
        const isBlocked = blockNumber.includes(sender.id)
        const isNsfw = isGroupMsg ? nsfw_.includes(chat.id) : false
        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname))
        if (isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname), 'in', color(formattedTitle))
        if (!isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname))
        if (isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname), 'in', color(formattedTitle))
        if (isBlocked) return
        //if (!isOwner) return
        switch(command) {



        case '!sticker':
        case '!figurinha':
        case '!stiker':
            if (isMedia && type === 'image') {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (quotedMsg && quotedMsg.type == 'image') {
                const mediaData = await decryptMedia(quotedMsg, uaOverride)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (args.length === 2) {
                const url = args[1]
                if (url.match(isUrl)) {
                    await client.sendStickerfromUrl(from, url, { method: 'get' })
                        .catch(err => console.log('Caught exception: ', err))
                } else {
                    client.reply(from, mess.error.Iv, id)
                }
            } else {
                    client.reply(from, mess.error.St, id)
            }
            break


        case '!gif':
        case '!animada':
        case '!stickergif':
        case '!stikergif':
        case '!sgif':
            if (isMedia) {
                if (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10) {
                    const mediaData = await decryptMedia(message, uaOverride)
                    client.sendText(from, '[Espere] Transformando sua midia em um Sticker +- 1Minuto, caso nao responda em 1 minuto essa midia nao pode ser transformada em stricker devido as regras do whatsapp')
                    const nuberof = Math.floor((Math.random()*1000) + 1)
                    const filename = `./media/${nuberof}.${mimetype.split('/')[1]}`
                    await fs.writeFileSync(filename, mediaData)
                    console.log('1')
                    await exec(`gify ${filename} ./media/${nuberof}.gif --fps=30 --scale=240:240`, async function (error, stdout, stderr) {
                        console.log('2')
                        const gif = await fs.readFileSync(`./media/${nuberof}.gif`, { encoding: "base64" })
                        console.log('3')
                        await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                        console.log('4')
                    })


                    fs.unlink(`./media/${nuberof}.gif`, function(err) {
                            if(err && err.code == 'ENOENT') {
                            console.info("File doesn't exist, won't remove it.");
                            } else if (err) {
                                console.error("Error occurred while trying to remove file");
                            } else {
                                console.info(`removed`);
                            }
                    });

                    fs.unlink(filename, function(err) {
                            if(err && err.code == 'ENOENT') {
                            console.info("File doesn't exist, won't remove it.");
                            } else if (err) {
                                console.error("Error occurred while trying to remove file");
                            } else {
                                console.info(`removed`);
                            }
                    });




                } else (
                    client.sendText(from, '[❗] Utilizar gif/videos de até 10s!')
                )
            }
            break


        case '!menu':
            client.sendText(from, '[❗] Envie !sgif na descriçao de um video ou gif para ser respondido com um stricker da midia enviada')
            client.sendText(from, '[❗] Envie !stricker na descriçao de uma imagem para ser respondido com um stricker da midia enviada')

        
        case '!ig':
            if (args.length === 1) return client.sendText(from, 'Para baixar videos ou imagems do instagram envie "!ig + link do video ou foto"')
            if (!args[1].match(isUrl) && !args[1].includes('instagram.com')) return client.sendText(from, mess.error.Iv)
            try {
                client.reply(from, mess.wait, id)
                const resp = await get.get('https://mhankbarbar.herokuapp.com/api/ig?url='+ args[1]).json()
                if (resp.result.includes('.mp4')) {
                    var ext = '.mp4'
                } else {
                    var ext = '.jpg'
                }
                await client.sendFileFromUrl(from, resp.result, `igeh${ext}`, '', id)
            } catch {
                client.reply(from, mess.error.Ig, id)
                }
            break
        
        case '!snk':
            client.reply(from, snk, id)
            break
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
        //client.kill().then(a => console.log(a))
    }
}
