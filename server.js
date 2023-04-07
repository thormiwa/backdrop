const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const cors = require('cors');
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
        getAccountName(bank_code: String!, account_number: String!): String!
    }

    type Mutation {
        verifyUser(user_account_number: String!, user_bank_code: String!, user_account_name: String!): User!
    }
`);


mongoose.connect(mongo_url, {})
    .then(res => app.listen(port, () => { console.log("Server running on port ", port); }))
    .catch(err => console.log("Unable to connect to MongoDB: ", err))