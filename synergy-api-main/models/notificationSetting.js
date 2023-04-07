const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    allNotifications: {type: Boolean, default: true},
    AdminNotification: {type: Boolean, default: true},
    joinLeaveNotification: {type: Boolean, default: true},
    chatMessageNotification: {type: Boolean, default: true},
  },
  {timestamps: true}
);

module.exports = mongoose.model("NotificationSetting", notificationSchema);
