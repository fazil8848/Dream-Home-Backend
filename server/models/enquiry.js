import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const enquirySchema = new mongoose.Schema({
    property_title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    property_id: {
        type: ObjectId,
        ref: "Property",
        required: true
    },
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    inetrest: {
        type: String
    }
});

const enquiryModel = mongoose.model( 'Enquiry', enquirySchema);

export default enquiryModel;