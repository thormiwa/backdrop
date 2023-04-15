const { User } = require('../models/user');
const { paystackAccountName, getLevenshteinDistance } = require('../utilities/utils');
const CustomError = require('../utilities/custom-error');

const verifyUser = async (req = {}) => {
    const { userAccountName, userBankCode, userAccountNumber } = req;
    const createOrFindUser = ({
        name,
        isVerified,
    }) => User.findOrCreate({
        where: { userAccountNumber, userBankCode },
        defaults: { userAccountName: name.toLowerCase(), isVerified },
    });
    // Check if user did not provide an account name
    if (!userAccountName) {
        throw new CustomError('Please provide an account name', 400);
    }
    // Check if user already exists
    const userExists = await User.findOne({
        where: { userAccountNumber, userBankCode },
    });

    switch (true) {
    case userExists && userExists.isVerified:
        throw new CustomError('User already exists and is verified!', 400);
    case userExists && !userExists.isVerified:
        throw new CustomError('User already exists!', 400);
    default:
    }

    // Call the Paystack API to get the account name on the bank account
    const name = await paystackAccountName(userAccountNumber, userBankCode);

    // save the user in the db using the paystack name
    const [newUser] = await createOrFindUser({ name, isVerified: false });

    // check if the account name from the Paystack API matches the account name the user provided
    const nameMatch = name.toLowerCase() === userAccountName.toLowerCase();
    // Compare the account name from the Paystack API
    // with the account name the user provided using the Levenshtein distance algorithm
    const distance = getLevenshteinDistance(name.toLowerCase(), userAccountName.toLowerCase());

    if (nameMatch || distance <= 2) {
        await newUser.update({ userAccountName, isVerified: true });
        return newUser;
    }
    throw new CustomError('Account name does not match', 400);
};

const getAccountName = async (req = {}) => {
    const { userBankCode, userAccountNumber, userAccountName } = req;
    const userData = await User.findOne({
        where: { userAccountNumber, userBankCode },
    });

    if (userData && userAccountName) {
    // Return the user's account name if available
        return userAccountName;
    }
    // Call the Paystack API to get the account name on the bank account
    const name = await paystackAccountName(userAccountNumber, userBankCode);

    // save the user in the db and set isVerified to false
    await User.create({
        userAccountNumber,
        userBankCode,
        user_account_name: name.toLowerCase(),
        isVerified: false,
    });

    return userAccountName;
};

module.exports = { verifyUser, getAccountName };
