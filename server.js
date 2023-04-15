const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');
const resolvers = require('./src/resolvers/user');
const { sequelize: userSequelize } = require('./src/models/user');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

const schema = buildSchema(`
    type User {
        id: ID!
        userAccountNumber: String!
        userBankCode: String!
        userAccountName: String
        isVerified: Boolean!
    }
    
    type Query {
        getAccountName(userBankCode: String!, userAccountNumber: String!): String!
    }

    type Mutation {
        verifyUser(userAccountNumber: String!, userBankCode: String!, userAccountName: String!): User!
    }
`);

app.use(cors());

const root = {
    getAccountName: resolvers.getAccountName,
    verifyUser: resolvers.verifyUser,
};

const errorHandler = (err) => {
    const { originalError } = err;
    const { message, statusCode } = originalError;
    return { message, statusCode };
};

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
    customFormatErrorFn: errorHandler,
}));

userSequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch((err) => {
    console.error('Unable to start server:', err);
});
