const User = require('../models/user');
const https = require('https');
const levenshtein = require('fast-levenshtein');
const { paystackAccountName } = require('../utils.js');

const verifyUser = async (args) => {
    user_account_name = args.user_account_name
    user_bank_code = args.user_bank_code
    user_account_number = args.user_account_number
    
    console.log(user_bank_code, user_account_number, user_account_name)
    // Check if user did not provide an account name
    if (!user_account_name) {
        const error = new Error('Please provide your account name');
        error.code = 400; 
    }
    // Call the Paystack API to get the account name on the bank account
    console.log("we are here")
    const name = await paystackAccountName(user_account_number, user_bank_code);
    console.log(name)
    // save the user in the db and set is_verified to false
    const [user, created] = await User.User.findOrCreate({
        where: {user_account_number, user_bank_code},
        defaults: {user_account_name: name.toLowerCase(), is_verified: false}
    });
    if (!created && user.is_verified === false) {
        const error = new Error('User already exists');
        error.code = 400; 
        console.log({error})
        throw error;
    } else if (user.is_verified === true){
        const error = new Error('User already exists and is verified');
        error.code = 400; 
        throw error;
    } else {
        // check if the account name from the Paystack API matches the account name the user provided
        const isMatch = name.toLowerCase() === user_account_name.toLowerCase();
        if (isMatch) {
            // Verify user if names match
            const user = await User.User.findOrCreate({
                where: {user_account_number, user_bank_code},
                defaults: {user_account_name: user_account_name.toLowerCase(), is_verified: true}
            });
            return user
        } else{
            // Compare the account name from the Paystack API with the account name the user provided using the Levenshtein distance algorithm
            const distance = levenshtein.get(name.toLowerCase(), user_account_name.toLowerCase());
            // If the names are within a distance of 2, set is_verified to true in the user object in the database
            if (distance >= 2) {
                const user = await User.User.findOrCreate({
                    where: {user_account_number, user_bank_code},
                    defaults: {user_account_name: user_account_name.toLowerCase(), is_verified: true}
                });
                return user
            } else {
                const error = new Error('Account name does not match')
                error.code = 400;
                throw error;
            }
        }
    }
}

const getAccountName = async (args) => {
    console.log(User.User);
    user_account_number = args.user_account_number;
    user_bank_code = args.user_bank_code;
    const user = await User.User.findOne({
      where: { user_account_number, user_bank_code },
    });
  
    if (user && user.user_account_name) {
      // Return the user's account name if available
      return user.user_account_name;
    } else {
      // Call the Paystack API to get the account name on the bank account
      const name = await paystackAccountName(user_account_number, user_bank_code);
  
      // save the user in the db and set is_verified to false
      const user = await User.User.create({
        user_account_number,
        user_bank_code,
        user_account_name: name.toLowerCase(),
        is_verified: false,
      });
  
      return user.user_account_name;
    }
};
  
module.exports = { verifyUser, getAccountName };