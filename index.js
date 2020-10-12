const { create, Client } = require('@open-wa/wa-automate')
const welcome = require('./lib/welcome')
const msgHandler = require('./msgHndlr')
const options = require('./options')
const http = require("http");




var server = http.createServer((req, res) => {
  console.log('ABERTOOOO')
});

server.listen(process.env.PORT || 80, () => {
  console.log("Listening on po rt 80");
});




function startKeepAlive() {
    setInterval(function() {
        var options = {
            host: 'bnamix.herokuapp.com',
            port: 80,
            path: '/'
        };
        http.get(options, function(res) {
            res.on('data', function(chunk) {
                try {
                    // optional logging... disable after it's working
                    console.log("HEROKU RESPONSE: " + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error: " + err.message);
        });
    }, 20 * 60 * 1000); // load every 20 minutes
}

startKeepAlive();


const start = async (client = new Client()) => {
		global.sclient = client
        global.sendingAnimatedSticker = []
        global.queueAnimatedSticker = []
        global.amdownloaden = []
        global.queuemp3 = []
        global.queuemp4 = []
        console.log('[SERVER] Server Started!')
        // Force it to keep the current session
        client.onStateChanged((state) => {
            console.log('[Cliet State]', state)
            if (state === 'CONFLICT' || state === 'UNLAUNCHED') client.forceRefocus()
        })
        // listening on message
        client.onMessage((async (message) => {
            client.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 3000) {
                    client.cutMsgCache()
                }
            })
            msgHandler(client, message)
        }))

        client.onGlobalParicipantsChanged((async (heuh) => {
            await welcome(client, heuh)
            //left(client, heuh)
            }))
        
        client.onAddedToGroup(((chat) => {
            let totalMem = chat.groupMetadata.participants.length
            client.sendText(chat.groupMetadata.id, `Salve grupo *${chat.contact.name}*`)
            
        }))

        /*client.onAck((x => {
            const { from, to, ack } = x
            if (x !== 3) client.sendSeen(to)
        }))*/

        // listening on Incoming Call
        client.onIncomingCall(( async (call) => {
            await client.sendText(call.peerJid, '📢 Não me ligue eu sou um Robo, Não sei Falar!, Vou te bloquear!')
            .then(() => client.contactBlock(call.peerJid))
        }))
    }

create('BarBar', options(true, start))
    .then(client => start(client))
    .catch((error) => console.log(error))