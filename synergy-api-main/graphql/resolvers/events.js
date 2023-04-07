const Event = require("../../models/event");
const User = require("../../models/user");
const Category = require("../../models/category");
const Booking = require("../../models/booking");
const {transformEvent} = require("./merge");
const {cancelBookingForDeleteEventOnly} = require("./booking");
module.exports = {
  // Get all events without deleted events
  events: async (args, req) => {
    /* if (!req.isAuth) {
      console.log("Unauthenticated");
      throw new Error("Unauthenticated!!");
    } */
    try {
      const currentUser = await User.findById(req.userId).populate("favoritedEvents");
      // Find events that are not deleted
      const events = await Event.find({isDeleted: undefined})
        .populate("host")
        .populate("category")
        .populate("participants");
      return events.map((event) => {
        // Check if event is favorited by current user
        const isFavorited = currentUser.favoritedEvents.some((el) => el._id.toString() === event._id.toString());
        return {
          ...transformEvent(event),
          isFavorited: isFavorited,
        };
      });
    } catch (err) {
      throw err;
    }
  },
  // Get all events including deleted events (for admin website)
  eventsWithDeletedAt: async (args, req) => {
    /* if (!req.isAuth) {
      console.log("Unauthenticated");
      throw new Error("Unauthenticated!!");
    } */
    try {
      //const currentUser = await User.findById(req.userId).populate("favoritedEvents");
      const events = await Event.find().populate("host").populate("category").populate("participants");
      return events.map((event) => {
        // Check if event is favorited by current user
        //const isFavorited = currentUser.favoritedEvents.some((el) => el._id.toString() === event._id.toString());
        return {
          ...transformEvent(event),
          //isFavorited: isFavorited,
        };
      });
    } catch (err) {
      throw err;
    }
  },
  deleteEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!!");
    }
    try {
      const eventToDelete = await Event.findOne({
        _id: args.eventId,
      });
      if (!eventToDelete) {
        throw new Error("No event to delete");
      } else {
        const result = await Event.deleteOne({
          _id: args.eventId,
        });
        console.log(result);
      }
      return eventToDelete;
    } catch (err) {
      throw err;
    }
  },
  softDeleteEvent: async (args, req) => {
    try {
      const fetchedEvent = await Event.findById(args.eventId).populate("host").populate("participants");
      // Remove the deleted events from the host's hosting events
      fetchedEvent.host.hostingEvent = await fetchedEvent.host.hostingEvent.filter(
        (data) => data._id.toString() != args.eventId.toString()
      );
      const bookings = await Booking.find();

      fetchedEvent.participants.map(async (participant) => {
        participant.joinedEvent = participant.joinedEvent.filter((data) => data.toString() != args.eventId.toString());
        await participant.save();
        //Remove relevant bookings
        bookings.map((booking) => {
          if (
            booking.event._id.toString() == args.eventId.toString() &&
            booking.user._id.toString() == participant._id.toString()
          ) {
            cancelBookingForDeleteEventOnly({
              eventId: args.eventId,
              userId: participant._id,
            });
          }
        });
      });

      await fetchedEvent.save();

      const eventToDelete = await Event.findOneAndUpdate(
        {
          _id: args.eventId,
        },
        {
          isDeleted: true,
          deletedAt: new Date().toString(),
        },
        {new: true}
      );
      console.log(eventToDelete);
      return {
        ...eventToDelete._doc,
        _id: eventToDelete._id,
      };
    } catch (err) {
      throw err;
    }
  },
  updateEvent: async (args, req) => {
    try {
      console.log(args.eventInput);
      const fetchedCategory = await Category.findOne({
        _id: args.eventInput.categoryId,
      });
      const eventToUpdate = await Event.findOneAndUpdate(
        {
          _id: args.eventInput.id,
        },
        {...args.eventInput, category: fetchedCategory},
        {new: true}
      );

      // console.log(fetchedCategory);
      console.log(eventToUpdate);
      return {
        ...eventToUpdate._doc,
        _id: eventToUpdate._id,
      };
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) throw new Error("Unauthenticated!!");

    const fetchedCategory = await Category.findOne({
      _id: args.eventInput.categoryId,
    });
    const event = new Event({
      category: fetchedCategory,
      title: args.eventInput.title,
      description: args.eventInput.description,
      date: args.eventInput.date,
      time: args.eventInput.time,
      venueType: args.eventInput.venueType,
      place: args.eventInput.place,
      placeId: args.eventInput.placeId,
      placeAddress: args.eventInput.placeAddress,
      placeLat: args.eventInput.placeLat,
      placeLng: args.eventInput.placeLng,
      eventType: args.eventInput.eventType,
      limitGroupSize: args.eventInput.limitGroupSize,
      groupSize: args.eventInput.groupSize,
      tags: args.eventInput.tags,
      skillLevel: args.eventInput.skillLevel,
      imageUrl: args.eventInput.imageUrl,
      host: req.userId,
      participants: req.userId,
    });
    try {
      const result = await event.save();
      const createdEvent = {
        ...result._doc,
        _id: result.id,
        host: User.bind(this, result.host),
        date: result.date,
        time: result.time,
        createdAt: new Date(result._doc.createdAt).toISOString(),
        updatedAt: new Date(result._doc.updatedAt).toISOString(),
      };

      const host = await User.findById(req.userId);
      if (!host) throw new Error("User not found");
      host.hostingEvent.push(event);
      host.joinedEvent.push(event);
      await host.save();
      console.log(createdEvent);
      return createdEvent;
    } catch (err) {
      throw err;
    }
  },
  eventById: async (args, req) => {
    console.log("eventById eventId: " + args.eventId);
    if (!req.isAuth) {
      console.log("Unauthenticated");
      throw new Error("Unauthenticated!!");
    }
    try {
      const event = await Event.findById(args.eventId).populate("host").populate("category").populate("participants");
      if (!event) {
        console.log("This event is no longer available.");
        throw new Error("This event is no longer available.");
      }
      // console.log("eventById event: ", event);
      // Check if event is favorited by current user
      const currentUser = await User.findById(req.userId).populate("favoritedEvents");
      const isFavorited = currentUser.favoritedEvents.some((el) => el._id.toString() === event._id.toString());
      return {
        ...transformEvent(event),
        isFavorited: isFavorited,
      };
    } catch (err) {
      throw err;
    }
  },
  // Get all events statistics and popular tags chart data for admin website
  eventStatsAndPopularTags: async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 59, 59);
      const thisWeekStart = new Date(now - 7 * 60 * 60 * 24 * 1000);
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      const nextMonthStart = new Date();
      nextMonthStart.setDate(1);
      nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

      const newEventsToday = await Event.count({
        createdAt: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      });
      const newEventsThisWeek = await Event.count({
        createdAt: {
          $gte: thisWeekStart,
          $lte: todayEnd,
        },
      });
      const newEventsThisMonth = await Event.count({
        createdAt: {
          $gte: thisMonthStart,
          $lt: nextMonthStart,
        },
      });

      // Combine all tags into array with duplicates [ 'music', 'gaming', 'music', 'fun', ... ]
      let tagsAllTime = [];
      let tagsThisMonth = [];
      let tagsThisWeek = [];
      const events = await Event.find();
      events.map((event) => {
        // combined tags for all events
        tagsAllTime = [...tagsAllTime, ...event.tags];

        // combined tags for all events created this month
        if (event.createdAt <= nextMonthStart && event.createdAt >= thisMonthStart) {
          tagsThisMonth = [...tagsThisMonth, ...event.tags];
        }
        // combined tags for all events created this week
        if (event.createdAt <= now && event.createdAt >= thisWeekStart) {
          tagsThisWeek = [...tagsThisWeek, ...event.tags];
        }
      });

      let tagsAllTimeObj = getObjectOfUniqueTagsWithCount(tagsAllTime); // { fun: 6, gaming: 3, music: 2, ... }
      var popularTagsAllTime = Object.keys(tagsAllTimeObj); // ['fun', 'gaming', 'music', ... ]
      var popularTagsAllTimeCount = Object.values(tagsAllTimeObj); // [6, 3, 2, ... ]

      let tagsThisMonthObj = getObjectOfUniqueTagsWithCount(tagsThisMonth);
      var popularTagsThisMonth = Object.keys(tagsThisMonthObj);
      var popularTagsThisMonthCount = Object.values(tagsThisMonthObj);

      let tagsThisWeekObj = getObjectOfUniqueTagsWithCount(tagsThisWeek);
      var popularTagsThisWeek = Object.keys(tagsThisWeekObj);
      var popularTagsThisWeekCount = Object.values(tagsThisWeekObj);

      return {
        newEventsToday,
        newEventsThisWeek,
        newEventsThisMonth,
        popularTagsAllTime,
        popularTagsAllTimeCount,
        popularTagsThisMonth,
        popularTagsThisMonthCount,
        popularTagsThisWeek,
        popularTagsThisWeekCount,
      };
    } catch (err) {
      throw err;
    }
  },
};

const getObjectOfUniqueTagsWithCount = (tagsArray) => {
  // Gets an object of unique tags with their count
  // {  gaming: 3, music: 2, fun: 6, ... }
  var uniqs = tagsArray.reduce((acc, val) => {
    acc[val] = acc[val] === undefined ? 1 : (acc[val] += 1);
    return acc;
  }, {});

  // Sort tags by descending count
  // { fun: 6, gaming: 3, music: 2, ... }
  let sortedObj = Object.entries(uniqs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // limit to top 10 key-value pairs
    .reduce((_sortedObj, [k, v]) => ({..._sortedObj, [k]: v}), {});

  return sortedObj;
};
