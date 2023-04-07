const User = require("../../models/user");
const Event = require("../../models/event");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {user: transFormUser} = require("./merge");
const {assertSchema} = require("graphql");
const Booking = require("../../models/booking");
const {cancelBookingForDeleteAccountOnly} = require("./booking");
const NotificationSetting = require("../../models/notificationSetting");

module.exports = {
  // All resolvers function will be placed here.
  users: async () => {
    try {
      const users = await User.find().populate("favoritedEvents").populate("joinedEvent");
      return users.map((user) => {
        let deletedAt = user._doc.deletedAt;
        if (deletedAt) deletedAt = new Date(user._doc.deletedAt);
        let bannedAt = user._doc.bannedAt;
        if (bannedAt) bannedAt = new Date(user._doc.bannedAt);
        return {
          ...user._doc,
          _id: user.id,
          createdAt: new Date(user._doc.createdAt),
          updatedAt: new Date(user._doc.updatedAt),
        };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createUser: async (args) => {
    try {
      let pw = args.userInput.password;
      const existingUser = await User.findOne({
        email: args.userInput.email,
      });

      if (existingUser) {
        throw new Error("User already exists!");
      }
      const hashedPwd = await bcrypt.hash(pw, 12);
      const notificationSetting = new NotificationSetting();
      const user = new User({
        password: hashedPwd,
        type: args.userInput.type,
        fname: args.userInput.fname,
        sname: args.userInput.sname,
        email: args.userInput.email,
        mobile: args.userInput.mobile,
        profileImg: args.userInput.profileImg,
        desc: args.userInput.desc,
        notificationSetting: notificationSetting,
        appleIdentityToken:
          args.userInput.appleIdentityToken != undefined ? args.userInput.appleIdentityToken : undefined,
      });
      await notificationSetting.save();
      const result = await user.save();
      console.log("Created User", result);
      return {
        ...result._doc,
        _id: result.id,
        createdAt: new Date(result._doc.createdAt).toISOString(),
        updatedAt: new Date(result._doc.updatedAt).toISOString(),
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  login: async ({email, password}) => {
    try {
      const user = await User.findOne({
        email: email,
        deletedAt: undefined,
      });
      if (!user) {
        console.log("User doesn't exist!");
        throw new Error("User doesn't exist!");
      }
      if (user.type == "general") {
        if (user.password == "") {
          console.log("Password must not be empty!");
          throw new Error("Password must not be empty!");
        }
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        console.log("Password doesn't match!");
        throw new Error("Password doesn't match!");
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        "absolutelysupersecretkey",
        {
          expiresIn: "1h",
        }
      );
      // Set user's lastActiveAt date
      const filter = {
        email: email,
      };
      const update = {
        lastActiveAt: new Date(),
      };
      let result = await User.findOneAndUpdate(filter, update);
      return {
        userId: user.id,
        userType: user.type,
        token: token,
        tokenExpiration: 1,
      };
    } catch (err) {
      throw err;
    }
  },
  adminLogin: async ({email, password}) => {
    try {
      const user = await User.findOne({
        email: email,
      });
      console.log(user);
      if (!user) {
        console.log("User doesn't exist!");
        throw new Error("User doesn't exist!");
      }
      if (user.type != "admin") {
        console.log("Sorry. it is not a verified account.");
        throw new Error("Sorry. it is not a verified account.");
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        console.log("Password doesn't match!");
        throw new Error("Password doesn't match!");
      }
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        "absolutelysupersecretkey",
        {
          expiresIn: "1h",
        }
      );
      // Set user's lastActiveAt date
      const filter = {
        email: email,
      };
      const update = {
        lastActiveAt: new Date(),
      };
      let result = await User.findOneAndUpdate(filter, update);
      return {
        userId: user.id,
        userType: user.type,
        token: token,
        tokenExpiration: 1,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  userById: async ({userId}) => {
    try {
      let result = await User.findById(userId).populate("favoritedEvents").populate("joinedEvent");
      console.log(result);
      return {
        ...result._doc,
        _id: result.id,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  userByAppleIdentityToken: async ({appleIdentityToken}) => {
    try {
      console.log("hi");
      let result = await User.findOne({appleIdentityToken: appleIdentityToken});
      console.log(appleIdentityToken);
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  isPasswordAuthenticated: async ({userId, oldPassword}) => {
    try {
      const user = await User.findById(userId);
      const isEqual = await bcrypt.compare(oldPassword, user.password);
      if (!isEqual) return false;
      else return true;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  updateUser: async (args) => {
    try {
      const filter = args.userInput.userId;
      const userInput = args.userInput;
      if (userInput.password && userInput.password != "") {
        const hashedPwd = await bcrypt.hash(userInput.password, 12);
        userInput.password = hashedPwd;
      }
      const update = userInput;
      let result = await User.findByIdAndUpdate(filter, update, {
        new: true,
      });
      return {
        ...result._doc,
        _id: result.id,
        updatedAt: new Date(result._doc.updatedAt).toISOString(),
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  deleteUser: async (args) => {
    try {
      let userToDelete = await User.findOne({
        _id: args.userId,
      }).populate({
        path: "joinedEvent",
        populate: {
          path: "participants",
        },
      });
      //Remove User from joined Events
      userToDelete.joinedEvent.map((event) => {
        cancelBookingForDeleteAccountOnly({
          eventId: event._id,
          userId: args.userId,
        });
      });

      userToDelete = await User.findOneAndUpdate(
        {
          _id: args.userId,
        },
        {
          deletedAt: new Date().toString(),
          fname: "Deleted",
          sname: "User",
          email: "deleted_" + userToDelete.email,
          profileImg: "",
          desc: "",
          mobile: "",
        }
      );
      //Change User Data
      return userToDelete;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  banUser: async ({email}) => {
    try {
      const filter = email;
      console.log(filter);
      let result = await User.findOneAndUpdate(
        {
          email: filter,
        },
        {
          bannedAt: new Date(),
        },
        {
          new: true,
        }
      );
      return {
        ...result._doc,
        _id: result.id,
        updatedAt: new Date(result._doc.updatedAt).toISOString(),
        bannedAt: new Date(result._doc.bannedAt).toISOString(),
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  userCounts: async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 59, 59);
      const thisWeekStart = new Date(new Date() - 7 * 60 * 60 * 24 * 1000);
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      const nextMonthStart = new Date();
      nextMonthStart.setDate(1);
      nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
      console.log("now", now);
      console.log("todayStart", todayStart);
      console.log("todayEnd", todayEnd);
      console.log("thisWeekStart", thisWeekStart);
      console.log("thisMonthStart", thisMonthStart);
      console.log("nextMonthStart", nextMonthStart);
      const totalUserCount = await User.count();
      const newUserCountDay = await User.count({
        createdAt: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      });
      const newUserCountWeek = await User.count({
        createdAt: {
          $gte: thisWeekStart,
          $lte: todayEnd,
        },
      });
      const newUserCountMonth = await User.count({
        createdAt: {
          $gte: thisMonthStart,
          $lt: nextMonthStart,
        },
      });
      const activeUserCountDay = await User.count({
        lastActiveAt: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      });
      const activeUserCountWeek = await User.count({
        lastActiveAt: {
          $gte: thisWeekStart,
          $lte: todayEnd,
        },
      });
      const activeUserCountMonth = await User.count({
        lastActiveAt: {
          $gte: thisMonthStart,
          $lt: nextMonthStart,
        },
      });

      console.log("totalUserCount ", totalUserCount);
      return {
        totalUserCount,
        newUserCountDay,
        newUserCountWeek,
        newUserCountMonth,
        activeUserCountDay,
        activeUserCountWeek,
        activeUserCountMonth,
      };
    } catch (err) {
      console.log("err ", err);
      throw err;
    }
  },
  getHostingEventById: async (args, req) => {
    // if (!req.isAuth) {
    //   console.log("Unauthenticated");
    //   throw new Error("Unauthenticated!!");
    // }
    try {
      // const user = await transFormUser(args.userId);
      const user = await User.findById(args.userId).populate({
        path: "hostingEvent",
        populate: {
          path: "category",
        },
      });
      const hostingEvents = user.hostingEvent;
      return hostingEvents;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  checkUserExists: async (args) => {
    console.log("Check user's email ", args.userEmail);
    try {
      const existingUser = await User.findOne({
        email: args.userEmail,
      });
      console.log(existingUser);
      if (existingUser) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getEventsById: async ({userId}) => {
    try {
      let result = await User.findById(userId).populate("joinedEvent");
      return {
        ...result._doc,
        _id: result.id,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getFavoritedEventsById: async ({userId}) => {
    try {
      let result = await User.findById(userId).populate("favoritedEvents");
      return {
        ...result._doc,
        _id: result.id,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  favouriteOrUnfavouriteEvent: async ({eventId, userId}) => {
    try {
      // Check if event is favorited by user
      const user = await User.findById(userId).populate("favoritedEvents");
      const isFavorited = user.favoritedEvents.some((el) => el._id.toString() === eventId); //find id in array
      let result = false; // to return result if it is successfully updated or not.
      console.log("Event is favorited", isFavorited);
      if (!isFavorited) {
        await User.updateOne(
          // Add event to array
          {
            _id: userId,
          },
          {
            $addToSet: {
              favoritedEvents: eventId,
            },
          }, //only add if event is not present
          {
            new: true,
          }
        );
        result = true;
      } else {
        await User.updateOne(
          // Remove event from array
          {
            _id: userId,
          },
          {
            $pull: {
              favoritedEvents: eventId,
            },
          },
          {
            new: true,
          }
        );
        result = true;
      }
      // let result = await User.findById(userId).populate("favoritedEvents");
      return result;
    } catch (err) {
      throw err;
    }
  },
  storePushToken: async (args) => {
    try {
      let userWithPushToken = await User.findByIdAndUpdate(args.userId, {
        pushToken: args.pushToken,
      });
      console.log("user's pushtoken", userWithPushToken.pushToken);
      return {
        ...userWithPushToken._doc,
        _id: userWithPushToken._id,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  removePushToken: async (args) => {
    try {
      const result = await User.findByIdAndUpdate({_id: args.userId}, {pushToken: ""}, {new: true});
      result.save();
      console.log("sign-out, push token removed");
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getNotificationSetting: async (args) => {
    try {
      const user = await User.findById(args.userId).populate("notificationSetting");
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
  blockUser: async (args) => {
    try {
      let result = await User.findById({
        _id: args.myId,
      });
      const blockedUser = result.blockedUser;
      for (i = 0; i < blockedUser.length; i++) {
        if (blockedUser[i] == args.userIdToBlock) {
          throw new Error("Unable to block the user.");
        }
      }
      result = await User.findByIdAndUpdate(
        {
          _id: args.myId,
        },
        {
          blockedUser: [...blockedUser, args.userIdToBlock],
        },
        {
          new: true,
        }
      );

      console.log(result);
      return result;
      // console.log(args.userIdToBlock);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  unblockUser: async (args) => {
    try {
      let result = await User.findById({
        _id: args.myId,
      });
      const CurrentBlockedUser = result.blockedUser;
      for (i = 0; i < CurrentBlockedUser.length; i++) {
        if (CurrentBlockedUser[i] == args.userIdToUnblock) {
          CurrentBlockedUser.splice(i, 1);
          i--;
        }
      }
      result = await User.findByIdAndUpdate(
        {
          _id: args.myId,
        },
        {
          blockedUser: CurrentBlockedUser,
        },
        {
          new: true,
        }
      );

      console.log(result);
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getAllBlockedUser: async (args) => {
    try {
      let result = await User.findById({
        _id: args.userId,
      });
      console.log(result);
      return {
        ...result._doc,
        _id: result.id,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getDetailsByBlockedUserId: async (args) => {
    try {
      let blockedUsersArr = [];
      for (i = 0; i < args.userIds.length; i++) {
        let result = await User.findById({
          _id: args.userIds[i],
        });
        let blockedUser = new User({...result._doc, _id: result.id});
        blockedUsersArr.push(blockedUser);
      }
      return blockedUsersArr;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
