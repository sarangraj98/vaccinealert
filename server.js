const fetch = require('node-fetch');
const Bluebird = require('bluebird');
const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config()
fetch.Promise = Bluebird;
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const pincodes = ['670521', '670307'];
var countMessageSend = [
    {
        pincode: '670521',
        count: 1
    },
    {
        pincode: '670307',
        count: 1
    }
]
async function getData() {
    pincodes.forEach(item => {
        const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${item}&date=${moment().add(1, 'day').utc("+05:30").format('DD-MM-YYYY')}`
        fetch(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
            },
            gzip: true
        })
            .then(res => res.json())
            .then(async (json) => {
                if (json?.sessions.length > 0) {
                    const objIndex = countMessageSend.findIndex(el => el.pincode === item)
                    json.sessions.forEach(subItem => {
                        if (countMessageSend[objIndex].count <= 5) {
                            sendMessageToBot(subItem.min_age_limit, subItem.pincode);
                            console.log(countMessageSend)
                        }
                    })
                    countMessageSend[objIndex].count += 1;
                }
            })
    })
    if (String(moment().utc("+05:30").format('HH')) === '24') {
        countMessageSend.map((item) => {
            item.count = 1
        });
    }
}
const sendMessageToBot = (ageLimit, pincode) => {
    bot.sendMessage(463119761, `Book fast vaccine available for Age : ${ageLimit} in pincode: ${pincode} `)
}
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text === '/start') return bot.sendMessage(chatId, 'Thanks for subscribing wait we will notify you!');
    bot.sendMessage(chatId, 'Hey wait for your turn., We will notify !')
});
setInterval(() => { getData() }, 5000)
console.log('************')

