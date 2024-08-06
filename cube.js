const axios = require('axios');
const fs = require('fs');

const appToken = 'd1690a07-3780-4068-810f-9b5bbf2931b2';
const promoId = 'b4170868-cef0-424f-8eb9-be0622e8e8e3';
const filePath = 'cube.txt';

async function generateClientId() {
    const timestamp = Date.now();
    const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
    return `${timestamp}-${randomNumbers}`;
}

async function loginClient() {
    const clientId = await generateClientId();
    try {
        const response = await axios.post('https://api.gamepromo.io/promo/login-client', {
            appToken: appToken,
            clientId: clientId,
            clientOrigin: 'deviceid'
        }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            }
        });
        return response.data.clientToken;
    } catch (error) {
        console.error('Ошибка при входе клиента:', error.message);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return loginClient();
    }
}

async function registerEvent(token) {
    const eventId = generateRandomUUID();
    try {
        const response = await axios.post('https://api.gamepromo.io/promo/register-event', {
            promoId: promoId,
            eventId: eventId,
            eventOrigin: 'undefined'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8',
            }
        });

        if (response.data.hasCode === false) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            return registerEvent(token);
        } else {
            return true;
        }
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return registerEvent(token);
    }
}

async function createCode(token) {
    let response;
    do {
        try {
            response = await axios.post('https://api.gamepromo.io/promo/create-code', {
                promoId: promoId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=utf-8',
                }
            });
        } catch (error) {
            console.error('Ошибка при создании кода:', error.message);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } while (!response || !response.data.promoCode);

    return response.data.promoCode;
}

function generateRandomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
              v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function saveCodeToFile(code) {
    fs.appendFile(filePath, code + '\n', (err) => {
        if (err) {
            console.error('Ошибка при сохранении кода в файл:', err.message);
        }
    });
}

async function main() {
    try {
        const tasks = [];
        for (let i = 0; i < 34; i++) {
            tasks.push(gen());
        }
        await Promise.all(tasks);
    } catch (error) {
        console.error('Ошибка:', error.response ? error.response.data : error.message);
    }
}

async function gen() {
    const token = await loginClient();
    await registerEvent(token);
    const codeData = await createCode(token);
    console.log(codeData);
    await saveCodeToFile(codeData);
}

main();
