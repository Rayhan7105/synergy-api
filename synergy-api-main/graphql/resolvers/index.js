const authResolver = require("./auth");
const eventsResolver = require("./events");
const bookingResolver = require("./booking");
const policyResolver = require("./policy");
const categoryResolover = require("./category");
const reportResolver = require("./report");
const chatRoomResolver = require("./chatRoom");
const pushNotificationResolver = require("./pushNotification");
const notificationSettingResolver = require("./notificationSetting");

const rootResolver = {
  ...authResolver,
  ...eventsResolver,
  ...bookingResolver,
  ...policyResolver,
  ...categoryResolover,
  ...reportResolver,
  ...chatRoomResolver,
  ...pushNotificationResolver,
  ...notificationSettingResolver,
};
module.exports = rootResolver;
