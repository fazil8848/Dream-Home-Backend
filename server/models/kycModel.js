import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const kycSchema = new mongoose.Schema({
    owner:{
        type: ObjectId,
        required: true,
        ref:'owner'
    },
    full_name: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    PAN: {
        type: String,
        required: true,
        unique: true
    },
    portrate: {
        type: String,
        required: true
    },
    work_details: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    occupation: {
        type: String,
        required: true
    },
    pin_code: {
        type: String,
        required: true
    },
    isApproved:{
        type: String,
        default: 'false'
    },
});

const kycModel = mongoose.model('KYC', kycSchema);

export default kycModel;