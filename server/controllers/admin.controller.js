import Admin from "../models/adminModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToke.js";
import User from "../models/user.js";
import Owner from "../models/owner.js";
import KYC from "../models/kycModel.js";
import Property from "../models/property.js";

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  if (!users) {
    res.json({ error: "Error Finding Users" }).status(404);
    return;
  } else {
    res.status(200).json({ users });
  }
});

const getOwners = asyncHandler(async (req, res) => {
  const owners = await Owner.find();
  if (!owners) {
    res.json({ error: "Error finding Owners" }).status(404);
    return;
  } else {
    res.status(200).json({ owners });
  }
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPass(password))) {
    generateToken.generatAdminToken(res, admin._id);
    res.status(201).json({
      _id: admin._id,
      email: admin.email,
    });
  } else {
    res.json({ error: "Invalid email or password" }).status(404);
    return;
  }
});

const adminLogout = asyncHandler(async (req, res) => {
  res.cookie("adminToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Admin Logged Out" });
});

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (user) {
    const setBlocked = !user.is_Blocked;
    const result = await User.findByIdAndUpdate(userId, {
      $set: { is_Blocked: setBlocked },
    });

    const users = await User.find();

    res
      .status(201)
      .json({ message: "User Updated Successfully", result, users });
  } else {
    res.json({ error: "User not found" }).status(404);
    return;
  }
});

const blockOwner = asyncHandler(async (req, res) => {
  const { ownerId } = req.body;

  const owner = await Owner.findById(ownerId);
  if (owner) {
    const setBlocked = !owner.is_Blocked;
    const result = await Owner.findByIdAndUpdate(ownerId, {
      $set: { is_Blocked: setBlocked },
    });

    const owners = await Owner.find();

    res
      .status(201)
      .json({ message: "Owner Updated Successfully", result, owners });
  } else {
    res.json({ error: "Owner not found" }).status(404);
    return;
  }
});

const getKYCs = async (req, res) => {
  try {
    const kycs = await KYC.find();

    if (kycs) {
      return res
        .status(200)
        .json({ success: true, message: "KYCs retrived successfully", kycs });
    }
  } catch (error) {
    console.log("Error While Getting Kycs:-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

const approveKyc = async (req, res) => {
  try {
    const { kycId, approval } = req.body;
    const result = await KYC.findByIdAndUpdate(
      kycId,
      { $set: { isApproved: approval } },
      { new: true }
    );
    if (result && approval === "Approved") {
      const ownerUpdated = await Owner.findByIdAndUpdate(
        result.owner,
        { $set: { kycApproved: true } },
        { new: true }
      );

      const kycs = await KYC.find();

      if (ownerUpdated && kycs) {
        res
          .status(201)
          .json({
            success: true,
            message: "KYC Updated successfully",
            result,
            kycs,
          });
      } else {
        return res
          .json({ success: false, error: "Error While Approving Kycs " })
          .status(401);
      }
    } else if (result && approval === "Disapproved") {
      const ownerUpdated = await Owner.findByIdAndUpdate(
        result.owner,
        { $set: { kycApproved: false } },
        { new: true }
      );

      const kycs = await KYC.find({}, { new: true });
      console.log(kycs);

      if (ownerUpdated && kycs) {
        res
          .status(201)
          .json({
            success: true,
            message: "KYC Updated successfully",
            result,
            kycs,
          });
      } else {
        return res
          .json({ success: false, error: "Error While Approving Kycs " })
          .status(401);
      }
    } else {
      return res
        .json({ success: false, error: "Error While Approving Kycs " })
        .status(401);
    }
  } catch (error) {
    console.log("Error While Approving Kycs:-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await Property.find();

    if (properties) {
      res
        .status(200)
        .json({
          success: true,
          message: "Properties retrieved successfully",
          properties,
        });
    } else {
      return res
        .json({ success: false, error: "No  properties available" })
        .status(401);
    }
  } catch (error) {
    console.log("Error While Getting properties:-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

const propertyApproval = async (req, res) => {
  try {
    const { id } = req.query;
    const { option } = req.body;

    const property = await Property.findById(id);
    if (property) {
      property.isApproved = option;

      await property.save();
      const properties = await Property.find();

      res
        .status(200)
        .json({
          success: true,
          message: "Property Updated successfully",
          properties,
        });
    } else {
      return res
        .json({ success: false, error: "Cannot Manage Property" })
        .status(500);
    }
  } catch (error) {
    console.log("Error While managing property:-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export default {
  getUsers,
  adminLogin,
  adminLogout,
  blockUser,
  getOwners,
  blockOwner,
  getKYCs,
  approveKyc,
  getProperties,
  propertyApproval,
};
