import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Owner from "../models/owner.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.userToken;
    console.log(token);
    if (!token) {
      return res.status(401).json({ error: "Not authorized, Invalid token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, Invalid token");
  }
};

const userVerification = async (userId) => {
  try {
    let user = await User.findByIdAndUpdate(
      userId,
      { $set: { isVerified: true } },
      { new: true }
    );
    return user;
  } catch (error) {
    console.log("ERROR @userVerification middleware:- ", error.message);
  }
};

const ownerVerification = async (ownerId) => {
  try {
    let owner = await Owner.findByIdAndUpdate(
      ownerId,
      { $set: { isVerified: true } },
      { new: true }
    );
    return owner;
  } catch (error) {
    console.log("ERROR @ownerVerification middleware:- ", error.message);
  }
};

export { protect, userVerification, ownerVerification };
