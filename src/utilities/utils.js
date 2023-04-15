const https = require('https');
const levenshtein = require('fast-levenshtein');

const paystackAccountName = (
    userAccountNumber,
    userBankCode,
) => new Promise((resolve, reject) => {
    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: `/bank/resolve?account_number=${userAccountNumber}&bank_code=${userBankCode}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
    };
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('error', () => reject(new Error('Error getting account name. Please try again later.')));

        res.on('end', async () => {
            const parsedData = JSON.parse(data);
            if (res.statusCode === 200) {
                resolve(parsedData.data.account_name);
            } else {
                reject(new Error(parsedData.message));
            }
        });
    });

    req.on('error', reject);
    req.end();
});

const getLevenshteinDistance = (text, compareText) => levenshtein.get(text, compareText);

module.exports = { paystackAccountName, getLevenshteinDistance };
