const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const policySchema = new Schema(
    {
        appPolicy: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Policy", policySchema);
