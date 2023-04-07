const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venueType: { type: String, required: true },
    imageUrl: { type: String, required: false },
    place: { type: String, required: false },
    placeId: { type: String, required: false },
    placeAddress: { type: String, required: false },
    placeLat: { type: Number, required: false },
    placeLng: { type: Number, required: false },
    eventType: { type: String, required: true },
    limitGroupSize: { type: String, required: true },
    groupSize: { type: String, required: false },
    tags: [{ type: String, required: false }],
    skillLevel: { type: String, required: true },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: { type: Boolean, required: false, defaultValue: false },
    deletedAt: { type: String, required: false, defaultValue: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
