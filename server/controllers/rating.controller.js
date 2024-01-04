import Review from "../models/reviewSchema.js";
import User from "../models/user.js";

export const addReview = async (req, res) => {
  try {
    const data = req.body;
    const addedReview = await Review.create(data);

    if (addedReview) {
      const reviews = await Review.find({ propertyId: data.propertyId });
      res.status(200).json({ success: true, reviews });
    } else {
      res.json({ error: "Error while adding Reviews" });
    }
  } catch (error) {
    console.log("Error While Adding Review :-", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const reviews = await Review.find({ propertyId }).populate({
      path: "user",
      select: "fullName",
    });
    if (reviews) {
      res.status(200).json({ success: true, reviews });
    } else {
      res.json({ error: "Error while Getting Reviews" });
    }
  } catch (error) {
    console.log("Error While Getting Reviews :-", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const propertyIncluded = async (req, res) => {
  try {
    const { propertyId, user } = req.body;
    let propertyBooked = false;
    const propertyIn = await User.find({
      _id: user,
      bookedProperties: { $in: [propertyId] },
    });
    if (propertyIn) {
      propertyBooked = true;
    }
    res.status(200).json({ success: true, propertyBooked });
  } catch (error) {
    console.log("Error While Checking propertyIncluded :-", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const editReview = async (req, res) => {
  try {
    const { id, rating, comment, propertyId } = req.body;
    const editedReview = await Review.findByIdAndUpdate(id, {
      $set: { rating, comment },
    });

    if (editedReview) {
      const reviews = await Review.find({ propertyId }).populate({
        path: "user",
        select: "fullName",
      });
      res.status(200).json({ success: true, reviews });
    } else {
      res.json({ error: "Error while adding Reviews" });
    }
  } catch (error) {
    console.log("Error While Editing Review :-", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id, propertyId } = req.body;
    const deletedReview = await Review.findByIdAndDelete(id);

    if (deletedReview) {
      const reviews = await Review.find({ propertyId }).populate({
        path: "user",
        select: "fullName",
      });
      res.status(200).json({ success: true, reviews });
    } else {
      res.json({ error: "Error while adding Reviews" });
    }
  } catch (error) {
    console.log("Error While Deleting Review :-", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};
