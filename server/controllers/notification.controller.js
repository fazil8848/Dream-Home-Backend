import Notification from "../models/notification.js";
import { getRecipientSocketId, io } from "../socket/socket.js";

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({
      reciever: userId,
    })
      .populate({
        path: "sender",
        select: "fullName profilePic",
        model: "User",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Notifications Fetched", notifications });
  } catch (error) {
    console.log("Error While Getting Notifications :- ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getNotificationsOwner = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({
      reciever: userId,
    })
      .populate({
        path: "sender",
        select: "fullName profilePic",
        model: "User",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Notifications Fetched", notifications });
  } catch (error) {
    console.log("Error While Getting Notifications :- ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addNotification = async (req, res) => {
  try {
    const data = req.body;
    const notification = await Notification.create(data);
    if (notification) {
      const recipientId = getRecipientSocketId(data.reciever);
      const notifications = await Notification.find({
        reciever: data.reciever,
      })
        .populate({
          path: "sender",
          select: "fullName profilePic",
          model: "User",
        })
        .sort({ createdAt: -1 });
      io.to(recipientId).emit("newNotification", notifications);
      res.status(201).json({ message: "Success", success: true });
    } else {
      return res.json({ error: "Cannot Forward Call" });
    }
  } catch (error) {
    console.log("Error While Adding Notification", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addNotificationOwner = async (req, res) => {
  try {
    const data = req.body;
    const notification = await Notification.create(data);
    if (notification) {
      const recipientId = getRecipientSocketId(data.reciever);
      const notifications = await Notification.find({
        reciever: data.reciever,
      })
        .populate({
          path: "sender",
          select: "fullName profilePic",
          model: "Owner",
        })
        .sort({ createdAt: -1 });
      io.to(recipientId).emit("newNotification", notifications);
      res.status(201).json({ message: "Success", success: true });
    } else {
      return res.json({ error: "Cannot Forward Call" });
    }
  } catch (error) {
    console.log("Error While Adding Notification", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id, userId } = req.body;
    const read = await Notification.findByIdAndUpdate(id, {
      $set: { read: true },
    });
    if (read) {
      const notifications = await Notification.find({
        reciever: userId,
      })
        .populate({
          path: "sender",
          select: "fullName profilePic",
          model: "User",
        })
        .sort({ createdAt: -1 });
      res.status(201).json({
        success: true,
        message: "Notification Marked Read",
        notifications,
      });
    }
  } catch (error) {
    console.log("Error While Marking read", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
