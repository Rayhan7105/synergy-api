const ChatRoom = require("../../models/chatRoom");
const User = require("../../models/user");
const {transformChatRoom} = require("../resolvers/merge");
const {inspect} = require("util");
module.exports = {
  chatRooms: async (args) => {
    // console.log(args.userId);
    const user = await User.findById(args.userId).populate({
      path: "chatRoom",
      populate: [{path: "msg"}, {path: "members"}],
    });
    const chatRooms = user.chatRoom;
    // console.log(chatRooms);
    // return chatRooms.map((chatRoom) => {
    //   return transformChatRoom(chatRoom);
    // });
    return chatRooms;
  },
  getAllMessages: async (args) => {
    try {
      const chatRoom = await ChatRoom.findById(args.chatId).populate({
        path: "msg",
        populate: [{path: "receiver"}, {path: "sender"}],
      });
      if (!chatRoom) {
        console.log("No chat room found");
        throw new Error("No chat room found");
      }
      // console.log(chatRoom);
      return {
        ...chatRoom._doc,
        _id: chatRoom._id,
      };
    } catch (err) {
      throw err;
    }
  },
  getLastMessage: async (args) => {
    try {
      const chatRoom = await ChatRoom.findById(args.chatId).populate("msg");
      let lastMessage = "";
      if (!chatRoom) {
        console.log("No chat room found");
        throw new Error("No chat room found");
      }

      lastMessage = chatRoom.msg[chatRoom.msg.length - 1];
      console.log(lastMessage);
      return lastMessage;
    } catch (err) {
      throw err;
    }
  },
  createChatRoom: async (args) => {
    try {
      const chatUser1 = await User.findById(args.userId1).populate({
        path: "chatRoom",
        populate: {
          path: "members",
        },
      });
      const chatUser2 = await User.findById(args.userId2).populate({path: "chatRoom.members"});
      let isExist = false;
      let existing_chatRoom = new ChatRoom();
      chatUser1.chatRoom.map((chatRoom) => {
        if (chatRoom.members[1]._id.toString() == chatUser2._id) {
          console.log(chatUser2._id, "chat room exists");
          isExist = true;
          console.log(chatRoom);
          existing_chatRoom = chatRoom;
        }
      });
      if (!isExist) {
        console.log("Let's create");
        const chatRoom = new ChatRoom({
          members: [chatUser1, chatUser2],
          msg: [],
        });

        const result = await chatRoom.save();
        await User.findOneAndUpdate(
          {_id: args.userId1},
          {
            chatRoom: [...chatUser1.chatRoom, result._id],
          }
        );
        await User.findOneAndUpdate(
          {_id: args.userId2},
          {
            chatRoom: [...chatUser2.chatRoom, result._id],
          }
        );
        return {
          ...result._doc,
          _id: result._id,
        };
      } else {
        console.log("cannot create");
        return existing_chatRoom;
      }
    } catch (err) {
      throw err;
    }
  },
};
