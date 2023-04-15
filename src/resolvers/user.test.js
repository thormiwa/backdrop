const { verifyUser, getAccountName } = require('./user');

const name = 'Tomiwa Daniel';
const userAccountName = 'Daniel Tomiwa';
const userBankCode = '073';
const userAccountNumber = '1234567890';

const mockUser = {
    isVerified: true,
    update: jest.fn(() => Promise.resolve({ isVerified: true })),
};

jest.mock('../utilities/utils.js', () => ({
    paystackAccountName: jest.fn(() => Promise.resolve(name)),
    getLevenshteinDistance: jest.fn(() => 1),
}));

jest.mock('../models/user', () => ({
    User: {
        findOrCreate: jest.fn(
            () => Promise.resolve([mockUser, true]),
        ),
        findOne: jest.fn((args) => {
            switch (true) {
            case args.where.userAccountNumber === userAccountNumber
                && args.where.userBankCode === userBankCode:
                return Promise.resolve({ isVerified: true });
            case args.where.userAccountNumber === userAccountNumber
                && args.where.userBankCode !== userBankCode:
                return Promise.resolve({ isVerified: false });
            default:
                return Promise.resolve(null);
            }
        }),
        create: jest.fn(
            () => Promise.resolve({ isVerified: false }),
        ),
    },
}));

describe('verifyUser', () => {
    it('throws an error if the user does not provide an account name', () => {
        const runVerify = verifyUser();
        expect(runVerify).rejects.toThrow('Please provide an account name');
    });

    it('throws an error if the user already exists and is verified', () => {
        const runVerify = verifyUser({ userAccountName, userBankCode, userAccountNumber });
        expect(runVerify).rejects.toThrow('User already exists and is verified!');
    });

    it('throws an error if the user already exists but is not verified', () => {
        const runVerify = verifyUser({ userAccountName, userBankCode: '000', userAccountNumber });
        expect(runVerify).rejects.toThrow('User already exists!');
    });

    it('returns the user if the account name matches', async () => {
        const runVerify = await verifyUser({ userAccountName: name, userBankCode: '000', userAccountNumber: '73737373' });
        expect(runVerify).toEqual(mockUser);
    });

    it('returns the user if the account name matches with a Levenshtein distance within length of 2', async () => {
        const runVerify = await verifyUser({ userAccountName, userBankCode: '000', userAccountNumber: '73737373' });
        expect(runVerify).toEqual(mockUser);
    });
});