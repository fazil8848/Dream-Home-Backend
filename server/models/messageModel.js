import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: ObjectId,
      required: true,
      ref: 'Conversation',
    },
    sender: { type: ObjectId, required: true },
    text: { type: String, required: true },
    read: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;