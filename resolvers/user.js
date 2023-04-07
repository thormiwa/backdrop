const User = require('../models/user');
const https = require('https');
const levenshtein = require('fast-levenshtein');

const verify = async (_, { user_bank_code, user_account_number, user_account_name }) => {
    // Check if user did not provide an account name
    if (!user_account_name) {
      throw new Error('Please provide an account name.');
    }
    // Call the Paystack API to get the account name on the bank account
    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: `/bank/resolve?account_number=${user_account_number}&bank_code=${user_bank_code}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    }
    const req = https.request(options, res => {
        let data = '';

        res.on('data', chunk => {
            data += chunk;
        });

        res.on('end', async () => {
            const paystackAccountName = JSON.parse(data).data.account_name;
            // check if the account name from the Paystack API matches the account name the user provided
            const isMatch = paystackAccountName === user_account_name;
            if (isMatch) {
                // Verify user if names match
                const user = await User.findOneAndUpdate(
                    { user_bank_code, user_account_number },
                    { user_account_name: user_account_name.toLowerCase(), is_verified: true },
                    { new: true , upsert: true }
                ).exec();
                return {message : `Verification of ${user_account_name} with ${user_account_number} was successful.`};
            } else {
                // Compare the account name from the Paystack API with the account name the user provided using the Levenshtein distance algorithm
                const distance = levenshtein.get(paystackAccountName.toLowerCase(), user_account_name.toLowerCase());
                // If the names are within a distance of 2, set is_verified to true in the user object in the database
                if (distance <= 2) {
                    const user = await User.findOneAndUpdate(
                        { user_bank_code, user_account_number },
                        { user_account_name: user_account_name.toLowerCase(), is_verified: true },
                        { new: true , upsert: true }
                    ).exec();
                    return {message : `Verification of ${user_account_name} with ${user_account_number} was successful.`};
                } else {
                    throw new Error(`The account name provided does not match the account name on the bank account. Please try again.`);
                }
            }
        });
    });
    req.on('error', error => {
        console.error(error);
        throw new Error('Error verifying account. Please try again later.');
    });
    
    req.end();
}
module.exports = { verify };