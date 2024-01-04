import mongoose from "mongoose";
import bcrypt from "bcrypt";
const ObjectId = mongoose.Types.ObjectId;

const ownerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  properties: {
    type: [ObjectId],
    ref: "Properties",
  },
  details_id: {
    type: ObjectId,
    ref: "details",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  kycAdded: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String,
    required: true,
    default:
      "https://res.cloudinary.com/dn6anfym7/image/upload/v1700566625/dreamHome/arqhv0bipniec9xpfu7m.jpg",
  },
  kycApproved: {
    type: Boolean,
    default: false,
  },
  is_Blocked: {
    type: Boolean,
    default: false,
  },
});

ownerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

ownerSchema.methods.matchPass = async function (enteredPass) {
  return await bcrypt.compare(enteredPass, this.password);
};

const ownerModel = mongoose.model("Owner", ownerSchema);

export default ownerModel;
