import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const reviewSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    propertyId: {
        type: ObjectId,
        ref: 'Property',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const reviewModel = mongoose.model('Review', reviewSchema);

export default reviewModel;