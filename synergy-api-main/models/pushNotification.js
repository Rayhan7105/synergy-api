const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pushNotificationSchema = new Schema(
  {
    to: [{type: String, required: false}],
    title: {type: String, required: false},
    body: {type: String, required: false},
  },
  {timestamps: true}
);

module.exports = mongoose.model("PushNotification", pushNotificationSchema);
