import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const bookingSchema = new mongoose.Schema({

  user: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  property: {
    type: ObjectId,
    required: true,
    ref: 'Property'
  },
  owner: {
    type: ObjectId,
    required: true,
    ref: 'Owner'
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
  },
  mobile: {
    type: Number,
    required: true
  },
  tokenAmount: {
    type: Number,
    required: true
  },
  tokenPaid: {
    type: Boolean,
    default: false
  },
  interest: {
    type: String,
  },
  is_cancelled: {
    type: Boolean,
    default: false,
  },

})

const bookingModel = mongoose.model('Booking', bookingSchema);


export default bookingModel;