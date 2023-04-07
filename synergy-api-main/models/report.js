const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    reportedUser: { type: Schema.Types.ObjectId, ref: "User" },
    offenderUser: { type: Schema.Types.ObjectId, ref: "User" },
    reasonCategory: { type: String, required: true },
    reasonDetails: { type: String, required: true },
    status: { type: String, required: true },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
