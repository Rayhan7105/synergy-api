const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    password: {type: String, required: true},
    type: {type: String, required: true},
    fname: {type: String, required: true},
    sname: {type: String, required: true},
    email: {type: String, required: true},
    mobile: {type: String, required: false}, // change unique to ture later
    profileImg: {type: String, required: false},
    desc: {type: String, required: false},
    hostingEvent: [{type: Schema.Types.ObjectId, ref: "Event"}],
    lastActiveAt: {type: Date, required: false},
    deletedAt: {type: Date, required: false},
    bannedAt: {type: Date, required: false},
    favoritedEvents: [{type: Schema.Types.ObjectId, ref: "Event"}],
    chatRoom: [{type: Schema.Types.ObjectId, ref: "ChatRoom"}],
    joinedEvent: [{type: Schema.Types.ObjectId, ref: "Event"}],
    pushToken: {type: String, required: false},
    blockedUser: [{type: String}],
    notification: [
      {
        type: Schema.Types.ObjectId,
        ref: "PushNotification",
      },
    ],
    notificationSetting: {type: Schema.Types.ObjectId, ref: "NotificationSetting"},
    appleIdentityToken: {type: String, required: false},
  },
  {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);
