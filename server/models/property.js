import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const propertySchema = new mongoose.Schema({
    owner: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    property_name: {
        type: String,
        required: true
    },
    property_type: {
        type: String,
        required: true
    },
    property_rent: {
        type: Number,
        required: true
    },
    property_description: {
        type: String,
        required: true
    },
    doc: {
        type: String,
        required: true
    },
    ImageUrls: {
        type: [String],
        required: true
    },
    ratings: [{
        type: ObjectId,
        ref: 'Review',
    }],
    property_location: {
        country: {
            type: String
        },
        state: {
            type: String
        },
        district: {
            type: String
        },
        locality: {
            type: String
        },
        address: {
            type: String
        },
        pin_code: {
            type: Number
        },
        longitude: {
            type: Number
        },
        latitude: {
            type: Number
        }
    },
    details: {
        built_up_area: {
            type: Number
        },
        carpet_area: {
            type: Number
        },
        number_bedrooms: {
            type: Number
        },
        number_bathrooms: {
            type: Number
        },
        number_balconies: {
            type: Number
        },
        furinishing_status: {
            type: String
        },
        road_accessibility: {
            type: Boolean
        },
        water_accessibilty: {
            type: String
        },
        power_backup: {
            type: Boolean
        },
        number_floors: {
            type: Number
        },
        type_flooring: {
            type: String
        }
    },
    amenities: {
        Wifi: {
            type: Boolean
        },
        AC: {
            type: Number
        },
        parking: {
            type: Number
        },
        pool: {
            type: Boolean
        },
        shoping_facility: {
            type: Boolean
        },
        hospital_facility: {
            type: Boolean
        },
        play_area: {
            type: Boolean
        },
        security: {
            type: Boolean
        },
        cctv: {
            type: Boolean
        }
    },
    is_available: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    is_Reserved: {
        type: Boolean,
        default: false
    },
    is_Booked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const propertyModel = mongoose.model('Property', propertySchema);

export default propertyModel;