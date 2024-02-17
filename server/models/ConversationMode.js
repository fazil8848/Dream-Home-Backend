import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: ObjectId, ref: "Owner" },
      { type: ObjectId, ref: "User" },
    ],
    lastMessage: {
      text: String,
      sender: { type: ObjectId },
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
