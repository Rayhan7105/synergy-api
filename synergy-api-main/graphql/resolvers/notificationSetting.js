const NotificationSetting = require("../../models/notificationSetting");

module.exports = {
  // All resolvers function will be placed here.
  updateNotificationSettings: async (args) => {
    try {
      console.log(args.notificationSettingInput);
      const setting = await NotificationSetting.findOneAndUpdate(
        {_id: args.notificationSettingInput._id},
        {
          allNotifications: args.notificationSettingInput.allNotifications,
          AdminNotification: args.notificationSettingInput.AdminNotification,
          joinLeaveNotification: args.notificationSettingInput.joinLeaveNotification,
          chatMessageNotification: args.notificationSettingInput.chatMessageNotification,
        },
        {new: true}
      );
      const result = await setting.save();
      // console.log("Updated setting is ", result);

      return result;
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  },
};
