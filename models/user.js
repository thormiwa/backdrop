const mongoose = require("mongoose");

// Create a schema for the user
const userSchema = new mongoose.Schema({
    user_account_number: { type : String, required: true },
    user_bank_code: { type : String, required: true },
    user_account_name: { type : String, required: true },
    is_verified: { type : Boolean, required: true }
});

module.exports = mongoose.model("User", userSchema);