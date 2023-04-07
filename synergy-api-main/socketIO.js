const User = require("./models/user");
const Message = require("./models/message");
const ChatRoom = require("./models/chatRoom");

module.exports = runSocketIO = (io) => {
  let currentChatRoom;
  io.on("connection", (socket) => {
    console.log("Socket ID", socket.id);
    socket.on("joinChat", ({chatRoom}) => {
      console.log(socket.id);
      currentChatRoom = chatRoom;
      socket.join(chatRoom);
      // console.log("Socket is in ", socket.rooms);
    });
    socket.on("unsubscribe", ({chatRoom}) => {
      socket.leave(chatRoom);
      console.log(`User just left chat romm ${chatRoom} `);
    });
    //Receiving messages from users
    socket.on("chat message", async (msg) => {
      try {
        const sender = await User.findById(msg.sender);
        const receiver = await User.findById(msg.receiver);
        const currentDate = new Date();
        let message = new Message({
          msg: msg.msg,
          sender: sender,
          receiver: receiver,
          createdAt: currentDate,
        });
        const chatRoom = await ChatRoom.findById(msg.chatId).populate("members");
        if (!chatRoom) {
          console.log("No chat room found.");
          throw new Error("No chat room found.");
        }
        const message_result = await message.save();
        if (!message_result) {
          console.log("Message is not saved.");
          /* strayed message deletion may be required later */
          throw new Error("Message is not saved.");
        }
        chatRoom.msg.push(message);
        const chatRoom_result = chatRoom.save();
        if (!chatRoom_result) {
          console.log("Error is occured. Contact your administrator.");
          throw new Error("Error is occured. Contact your administrator.");
        }
        message = {
          msg: message.msg,
          createdAt: currentDate.getTime(),
          sender: {
            _id: sender._id,
            fname: sender.fname,
            sname: sender.sname,
            pushToken: sender.pushToken,
          },
          receiver: {
            _id: receiver._id,
            fname: receiver.fname,
            sname: receiver.sname,
            pushToken: receiver.pushToken,
          },
        };
        io.sockets.in(msg.chatId).emit("message", {message: message});
      } catch (err) {
        console.log(err);
        throw err;
      }
    });
  });
};
