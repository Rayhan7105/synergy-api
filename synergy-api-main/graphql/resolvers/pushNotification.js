const PushNotification = require("../../models/pushNotification");
const User = require("../../models/user");

module.exports = {
  getPushNotification: async () => {
    const users = await User.find();
    console.log(users);
    // return pushNotifications.map((pushNotification) => {
    //   // console.log(pushNotification);
    //   return {
    //     ...pushNotification._doc,
    //     _id: pushNotification._id,
    //   };
    // });
  },
  getUserNotifications: async (args) => {
    console.log("UserID", args.userId);
    try {
      const user = await User.findById(args.userId).populate("notification");
      console.log(user);
      return {
        ...user._doc,
        _id: user._id,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createPushNotification: async (args) => {
    let IDs = args.eventParticipants;
    const pushNotification = new PushNotification({
      to: args.to,
      title: args.title,
      body: args.body,
    });
    const result = await pushNotification.save();
    console.log(result);
    try {
      IDs.map(async (userId) => {
        const user = await User.findById(userId);
        await user.notification.push(pushNotification._id);
        await user.save();
      });
      console.log(pushNotification);
      return {
        ...pushNotification._doc,
        _id: pushNotification._id,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createPushNotificationFromAdmin: async (args) => {
    try {
      const pushNotification = new PushNotification({
        to: args.to,
        title: args.title,
        body: args.body,
      });
      pushNotification.save();
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};
