const Event = require("../../models/event");
const User = require("../../models/user");
const Category = require("../../models/category");
const events = async (eventIds) => {
  try {
    const events = await Event.find({_id: {$in: eventIds}});
    return events.map((event) => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};
const transformEvent = (event) => {
  return {
    ...event._doc,
    _id: event._id,
    host: user.bind(this, event._doc.host),
  };
};
const transformBooking = (booking) => {
  return {
    ...booking,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: new Date(booking._doc.createdAt).toISOString(),
    updatedAt: new Date(booking._doc.updatedAt).toISOString(),
  };
};
const transformChatRoom = (chatRoom) => {
  return {
    ...chatRoom._doc,
    _id: chatRoom._id,
    members: singleChatRoom.bind(this, chatRoom._doc.members),
  };
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId).populate("hostingEvent");
    return {
      ...user._doc,
      _id: user._id,
      hostingEvent: events.bind(this, user._doc.hostingEvent),
    };
  } catch (err) {
    throw err;
  }
};
const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (err) {
    throw err;
  }
};
const singleChatRoom = async (members) => {
  try {
    return members.map(async (member) => {
      const result = await User.findById(member._id).populate("chatRoom");
      return result;
    });
  } catch (err) {
    throw err;
  }
};

// exports.user = user;
// exports.events = events;
// exports.singleEvent = singleEvent;
// exports.singleChatRoom = singleChatRoom;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
exports.transformChatRoom = transformChatRoom;
