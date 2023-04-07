const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    msg: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
