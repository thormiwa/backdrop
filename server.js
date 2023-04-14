const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const resolvers = require('./resolvers/user');
const user = require('./models/user');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;


const schema = buildSchema(`
    type User {
        id: ID!
        user_account_number: String!
        user_bank_code: String!
        user_account_name: String
        is_verified: Boolean!
    }
    
    type Query {
        getAccountName(user_bank_code: String!, user_account_number: String!): String!
    }

    type Mutation {
        verifyUser(user_account_number: String!, user_bank_code: String!, user_account_name: String!): User!
    }
`);

app.use(cors());

const root = {
    getAccountName: resolvers.getAccountName,
    verifyUser: resolvers.verifyUser
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    customFormatErrorFn: (err) => {
        const message = err.message;
        const statusCode = err.extensions?.response?.status || 500;
        // Return a custom error object with the message and status code
        return { message, statusCode };
    }
}));

user.User.sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch(err => {
    console.error('Unable to start server:', err);
});