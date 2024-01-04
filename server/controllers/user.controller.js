import User from "../models/user.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToke.js";
import { sendMail } from "../service/regMail.js";
import { userVerification } from "../middleware/authMiddleware.js";
import Properties from "../models/property.js";
import Booking from "../models/booking.js";
import Conversation from "../models/ConversationMode.js";
import Message from "../models/messageModel.js";
import {
  getRecipientSocketId,
  getSenderSocketId,
  io,
} from "../socket/socket.js";
import Owner from "../models/owner.js";
import Notification from "../models/notification.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { fisrtName, lastName, email, password, mobile } = req.body;

  const userExists = await User.findOne({ email });
  const fullName = fisrtName + " " + lastName;

  if (userExists) {
    res.json({ error: "Existing Email", created: false }).status(409);
    return;
  } else {
    const user = new User({
      fullName,
      email,
      password,
      mobile,
    });

    const verificationLink = `${process.env.USER_BASE_URl}/verifyUser/${user._id}`;

    const mailsend = await sendMail(
      email,
      "Account Verification",
      `<div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-image: url('https://res.cloudinary.com/dn6anfym7/image/upload/v1699417415/emailBackground.gif');  background-position: center; background-size: 100%;">

                <div style="background-color: rgba(255, 255, 255, 0.85); max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #333;">Account Verification</h1>
                    <p style="color: #000000;">Click the link below to verify your email:</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 20px;">Verify Email</a>
                </div>
        
            </div>`
    ).catch((err) => console.log(err));

    if (mailsend) {
      const savedUser = await user.save();
      if (savedUser) {
        res.status(201).json({
          user,
          created: true,
        });
      } else {
        res.json({ error: "Invalid User Data" }).status(404);
        return;
      }
    }
  }
});

export const googleRegister = async (req, res) => {
  try {
    const { body } = req;

    const userExists = await User.findOne({ email: body.email });
    if (userExists) {
      res.json({ error: "Existing Email", created: false }).status(403);
      return;
    }

    const user = await User.create({
      fullName: body.name,
      email: body.email,
      password: body.id,
      mobile: body.phone ? body.phone : "0000000000",
      is_Google: true,
      profilePic: body.photo,
      isVerified: true,
    });
    console.log(user);
    if (user) {
      res.status(201).json({
        user: {
          _id: user._id,
          name: user.fullName,
          email: user.email,
          profilePic: user.profilePic,
        },
      });
    } else {
      res
        .json({ error: "Couldn't Complete Registering Through Google" })
        .status(401);
    }
  } catch (error) {
    console.log("Error While Registering Through Google", error.message);
    res.json({ error: "Invalid User Data" }).status(404);
    return;
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userVerification(id);
    if (!result) {
      res.json({ error: "Cannot verify User" }).status(404);
      return;
    }
    const user = {
      _id: result._id,
      name: result.fullName,
      email: result.email,
    };
    res.status(200).json(user);
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user.is_Blocked) {
    res.json({ success: false, error: "Your Account is Blocked" }).status(401);
    return;
  }

  if (user && (await user.matchPass(password))) {
    generateToken.generateToken(res, user._id);
    req.user = user;
    res.status(201).json({
      _id: user._id,
      name: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } else {
    res.json({ error: "Invalid Email or Password" }).status(401);
    return;
  }
});

export const logOutUser = asyncHandler(async (req, res) => {
  res.cookie("userToken", "-", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "User Logged Out" }).status(200);
});

export const userProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.fullName,
    email: req.user.email,
  };
  res.status(200).json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const { email, fullName, mobile, profilePic } = req.body;
  const user = await User.findById(id);
  if (user) {
    user.fullName = fullName;
    user.email = email;
    user.mobile = mobile;
    user.profilePic = profilePic;
    const updatedUser = await user.save();
    res.status(200).json({
      updatedUser,
      message: "User updated successfully",
    });
  } else {
    res.json({ error: "User not found" }).status(401);
    return;
  }
});

export const getPropertiesUser = async (req, res) => {
  try {
    const properties = await Properties.find({
      isApproved: true,
      is_available: true,
      is_Booked: false,
    });

    if (properties) {
      res.status(201).json({
        success: true,
        message: "Properties successfully retrieved",
        properties,
      });
    } else {
      return res
        .json({ success: false, error: "Cannot retrieve Properties" })
        .status(500);
    }
  } catch (error) {
    console.log("Error While getting properties :-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const getSingleProperty = async (req, res) => {
  try {
    const { id } = req.query;
    const property = await Properties.findById(id);
    if (property) {
      res.status(201).json({
        success: true,
        message: "Property Retrieved Successfully",
        property,
      });
      return;
    } else {
      res
        .json({ success: false, error: "Property Does not Exist" })
        .status(404);
      return;
    }
  } catch (error) {
    console.log("Error While getting single property :-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await User.findById(id);

    if (user) {
      res.status(200).json({
        success: true,
        message: "successfully retrieved user data",
        user,
      });
    } else {
      res.json({ success: false, error: "Cannot find User" }).status(404);
      return;
    }
  } catch (error) {
    console.log("Error While getting userInfo :-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const checkPass = async (req, res) => {
  try {
    const { id } = req.query;
    const { password } = req.body;
    const user = await User.findById(id);

    if (user) {
      const matchingPassword = await user.matchPass(password);
      if (matchingPassword) {
        user.password = password;
        await user.save();
        res.status(200).json({
          success: true,
          message: "Password Verified Successfully",
          matchingPassword,
        });
      } else {
        res
          .json({ success: false, error: "Please Enter Correct Password" })
          .status(404);
        return;
      }
    } else {
      res.json({ success: false, error: "Cannot find User" }).status(404);
      return;
    }
  } catch (error) {
    console.log("Error While confirming password :-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const updatePass = async (req, res) => {
  try {
    const { id } = req.query;
    const { password } = req.body;
    const user = await User.findById(id);

    if (user) {
      user.password = password;
      const userUpdated = await user.save();

      if (userUpdated) {
        res.status(201).json({
          success: true,
          message: "Password Updated Successfully",
          userUpdated,
        });
      } else {
        res
          .json({ success: false, error: "Password Change Failed" })
          .status(404);
        return;
      }
    }
  } catch (error) {
    console.log("Error While updating password :-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const propertyBooking = async (req, res) => {
  try {
    const bookingInfo = req.body;
    const alreadyBooked = await Booking.findOne({
      property: bookingInfo.property,
      tokenPaid: true,
    });
    if (alreadyBooked) {
      return res
        .json({ success: false, error: "Property Already Booked" })
        .status(402);
    }
    await Booking.findOneAndDelete({
      property: bookingInfo.property,
      user: bookingInfo.user,
    });
    const booked = await Booking.create(bookingInfo);
    if (booked) {
      if (booked.tokenPaid) {
        await Booking.updateMany(
          { property: bookingInfo.property },
          {
            $set: { is_cancelled: true },
          }
        );
        await Properties.findByIdAndUpdate(
          bookingInfo.property,
          {
            $set: { is_available: false, is_Booked: true },
          },
          { new: true }
        );
        await User.findByIdAndUpdate(booked.user, {
          $addToSet: { bookedProperties: booked.property },
        });

        const data = {
          message: "New Property Booked",
          sender: booked.user,
          reciever: booked.owner,
          link: "http://localhost:3000/owner/bookings",
        };

        const notification = await Notification.create(data);
        if (notification) {
          const recipientId = getRecipientSocketId(booked.owner);
          const notifications = await Notification.find({
            reciever: booked.owner,
          }).populate({
            path: "sender",
            select: "fullName profilePic",
            model: "User",
          });
          io.to(recipientId).emit("newNotification", notifications);
        }

        res.status(201).json({
          success: true,
          message: "Property Booked Successfully",
          booked,
        });
        return;
      } else {
        await Properties.findByIdAndUpdate(bookingInfo.property, {
          $set: { is_Reserved: true },
        });

        await User.findByIdAndUpdate(booked.user, {
          $addToSet: { reservedproperties: booked.property },
        });

        const data = {
          message: "Property Reserved",
          sender: booked.user,
          reciever: booked.owner,
          link: "http://localhost:3000/owner/enquiries",
        };

        const notification = await Notification.create(data);
        if (notification) {
          const recipientId = getRecipientSocketId(booked.owner);
          const notifications = await Notification.find({
            reciever: booked.owner,
          }).populate({
            path: "sender",
            select: "fullName profilePic",
            model: "User",
          });
          io.to(recipientId).emit("newNotification", notifications);
        }
        res.status(201).json({
          success: true,
          message: "Property Reserved Successfully",
          booked,
        });
        return;
      }
    } else {
      return res
        .json({ success: false, error: "Property Booking Failed" })
        .status(402);
    }
  } catch (error) {
    console.log("Error While updating password :-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { ownerId, messageText, userId } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, ownerId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, ownerId],
        lastMessage: {
          text: messageText,
          sender: userId,
        },
      });

      await conversation.save();

      const recipientSocketId = getRecipientSocketId(ownerId);

      const newMessage = new Message({
        conversationId: conversation._id,
        sender: userId,
        text: messageText,
      });

      const newConversation = await Conversation.findOne({
        participants: { $in: [userId] },
      }).populate({
        path: "participants",
        select: "fullName profilePic",
        match: { _id: { $ne: userId } },
        model: "Owner",
      });

      const data = { newConversation, newMessage };

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newConversation", data);
      }
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: userId,
      text: messageText,
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: messageText,
          sender: userId,
        },
      }),
    ]);

    const recipientSocketId = getRecipientSocketId(ownerId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error While Sending Message :-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId, ownerId } = req.body;

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, ownerId] },
    });

    if (!conversation) {
      return res.json({ error: "Chat Not Found" }).status(404);
    }

    const updatedMessages = await Message.updateMany(
      {
        conversationId: conversation._id,
        sender: { $ne: userId },
        read: false,
      },
      { $set: { read: true } },
      { new: true }
    );

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    if (updatedMessages) {
      const senderSocketId = getSenderSocketId(ownerId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", messages);
      }
    }

    res.status(200).json({ messages, success: true });
  } catch (error) {
    console.error("Error While Getting Message :-", error.message);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const getConversations = async (req, res) => {
  try {
    const { userId } = req.query;
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    }).populate({
      path: "participants",
      select: "fullName profilePic",
      match: { _id: { $ne: userId } },
      model: "Owner",
    });

    if (!conversations) {
      return res.status(404).json({ error: "Conversations Not Found" });
    }

    res.status(200).json({ conversations, success: true });
  } catch (error) {
    console.log("Error While Getting Conversations :-", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const senderSocketId = getSenderSocketId(updatedMessage.sender);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageRead", updatedMessage);
    }

    res.json(updatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getClickedOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);
    if (owner) {
      res.status(200).json({ owner, success: true });
    } else {
      return res.json({ error: "Owner Not Found" }).status(404);
    }
  } catch (error) {
    console.log("Error While Getting ClickedOwner :-", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const getBookedDetails = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booked = await Booking.findById(bookingId);

    const booking = await Booking.findById(booked._id).populate([
      {
        path: "user",
        select: "email mobile fullName",
        match: { _id: { $eq: booked.user } },
        model: "User",
      },
      {
        path: "property",
        select: "property_name property_rent property_location.address",
        match: { _id: { $eq: booked.property } },
        model: "Property",
      },
    ]);
    if (booking) {
      res.status(200).json({ booking, success: true });
    } else {
      return res.json({ error: "booking Not Found" }).status(404);
    }
  } catch (error) {
    console.log("Error While Getting booking :-", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const getReservations = async (req, res) => {
  try {
    const { userId } = req.params;

    const reservations = await Booking.find({ user: userId, tokenPaid: false })
      .populate({
        path: "property",
        select: "property_name property_rent property_location.address",
      })
      .populate({
        path: "owner",
        select: "email mobile fullName",
      });

    res.status(201).json({ reservations });
  } catch (error) {
    console.log("Error While Getting the reservations");
    return res
      .status(500)
      .json({ success: flase, error: "Internal Server Error" });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { id, user } = req.body;
    const cancelled = await Booking.findByIdAndUpdate(
      id,
      {
        $set: { is_cancelled: true },
      },
      {
        new: true,
      }
    );

    if (cancelled) {
      const reservations = await Booking.find({ user, tokenPaid: false })
        .populate({
          path: "property",
          select: "property_name property_rent property_location.address",
        })
        .populate({
          path: "owner",
          select: "email mobile fullName",
        });
      res.status(201).json({
        success: true,
        message: "Reservation Cancelled Successfully",
        reservations,
      });
    } else {
      res
        .json({ error: "Cannot cancel reservation Please try again" })
        .status(404);
    }
  } catch (error) {
    console.log("Error While cancelling reservation:- ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ user: userId, tokenPaid: true })
      .populate({
        path: "property",
        select:
          "property_name property_rent property_location.address ImageUrls",
      })
      .populate({
        path: "owner",
        select: "email mobile fullName",
      });

    res.status(201).json({ bookings });
  } catch (error) {
    console.log("Error While Getting the bookings");
    return res
      .status(500)
      .json({ success: flase, error: "Internal Server Error" });
  }
};
