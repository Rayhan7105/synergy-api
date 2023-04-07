const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const placeSchema = new Schema(
    {
        placeId: { type: String, required: true },
        name: { type: String, required: true },
        address: { type: String, required: true },
        lat: { type: mongoose.Decimal128, required: true },
        lng: { type: mongoose.Decimal128, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Place", placeSchema);
