const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    iconType: { type: String, required: true },
    iconName: { type: String, required: true },
    numberOfEvents: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
