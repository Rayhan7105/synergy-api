const Booking = require("../../models/booking");
const Event = require("../../models/event");
const User = require("../../models/user");

const { transformEvent, transformBooking } = require("./merge");

module.exports = {
  bookings: async (req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!!");
    }
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async (args, req) => {
    console.log("book!");
    if (!req.isAuth) {
      throw new Error("Unauthenticated!!");
    }
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const fetchedUser = await User.findOne({ _id: args.userId });
    const booking = new Booking({
      user: fetchedUser,
      event: fetchedEvent,
    });
    const result = await booking.save();
    fetchedEvent.participants.push(args.userId);
    fetchedUser.joinedEvent.push(args.eventId);
    await fetchedEvent.save();
    await fetchedUser.save();
    return transformBooking(result);
  },
  cancelBooking: async (args, req) => {
    console.log("cancel booking!");
    if (!req.isAuth) {
      throw new Error("Unauthenticated!!");
    }
    try {
      const fetchedEvent = await Event.findById(args.eventId);
      const fetchedUser = await User.findById(args.userId);
      const bookings = await Booking.find().populate("event").populate("user");
      // delete all bookings with eventId and userId,
      // and remove user from event participants and event from user joinedEvents
      bookings.map(async (booking) => {
        if (
          booking.event._id.toString() == fetchedEvent._id.toString() &&
          booking.user._id.toString() == fetchedUser._id.toString()
        ) {
          fetchedEvent.participants = fetchedEvent.participants.filter(
            (data) => data.toString() != booking.user._id.toString()
          );
          fetchedUser.joinedEvent = fetchedUser.joinedEvent.filter(
            (data) => data.toString() != booking.event._id.toString()
          );
          await Booking.deleteOne({ _id: booking._id });
        }
      });

      await fetchedEvent.save();
      await fetchedUser.save();
      return fetchedEvent;
    } catch (err) {
      throw err;
    }
  },

  cancelBookingForDeleteAccountOnly: async (args, req) => {
    console.log("cancel booking!");
    try {
      const fetchedEvent = await Event.findById(args.eventId);
      const fetchedUser = await User.findById(args.userId);
      const bookings = await Booking.find().populate("event").populate("user");
      // delete all bookings with eventId and userId,
      // and remove user from event participants and event from user joinedEvents
      bookings.map(async (booking) => {
        if (
          booking.event._id.toString() == fetchedEvent._id.toString() &&
          booking.user._id.toString() == fetchedUser._id.toString()
        ) {
          fetchedEvent.participants = fetchedEvent.participants.filter(
            (data) => data.toString() != booking.user._id.toString()
          );
          await Booking.deleteOne({ _id: booking._id });
        }
      });

      await fetchedEvent.save();
      await fetchedUser.save();
      return fetchedEvent;
    } catch (err) {
      throw err;
    }
  },

  cancelBookingForDeleteEventOnly: async (args, req) => {
    console.log("cancel booking!");
    try {
      const fetchedEvent = await Event.findById(args.eventId);
      const fetchedUser = await User.findById(args.userId);
      const bookings = await Booking.find().populate("event").populate("user");
      // delete all bookings with eventId and userId,
      // and remove user from event participants and event from user joinedEvents
      bookings.map(async (booking) => {
        if (
          booking.event._id.toString() == fetchedEvent._id.toString() &&
          booking.user._id.toString() == fetchedUser._id.toString()
        ) {
          fetchedUser.joinedEvent = fetchedUser.joinedEvent.filter(
            (data) => data.toString() != booking.event._id.toString()
          );
          await Booking.deleteOne({ _id: booking._id });
        }
      });

      await fetchedEvent.save();
      await fetchedUser.save();
      return fetchedEvent;
    } catch (err) {
      throw err;
    }
  },
};
