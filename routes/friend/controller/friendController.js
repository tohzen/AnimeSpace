const Friend = require("../model/Friend");
const User = require("../../user/model/User.js");

const getAllFriends = async (req, res) => {
  try {
    const { decodedJwt } = res.locals;

    let payload = await User.findOne({ email: decodedJwt.email })
      .populate({
        path: "friends",
        model: Friend,
        select: "-__v",
      })
      .select("-email -password -firstName -lastName -__v -_id -username");

    res.json(payload);
  } catch (e) {
    res.status(500).json({ e: e, message: e.message });
  }
};

const createFriend = async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber } = req.body;

    const newFriend = new Friend({
      firstName,
      lastName,
      mobileNumber,
    });

    const savedNewFriend = await newFriend.save();
    //when you saved a friend - an ID is created from the databse

    const { decodedJwt } = res.locals;
    console.log(res.locals);
    //now we have to find the user ID

    const foundTargetUser = await User.findOne({ email: decodedJwt.email });

    foundTargetUser.friends.push(savedNewFriend._id);

    await foundTargetUser.save();

    res.json(savedNewFriend);
  } catch (e) {
    res.status(500).json({ e: e, message: e.message });
  }
};

const updateFriendById = async (req, res, next) => {
  let updateObj = {};
  let body = req.body;
  for (let key in body) {
    if (body[key] !== "") {
      updateObj[key] = body[key];
    }
  }

  console.log(updateObj);
  try {
    let updatedFriend = await Friend.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true }
    ).select("-__v");

    res.json({
      message: "success",
      payload: updatedFriend,
    });
  } catch (e) {
    next(e);
  }
};
const deleteFriendById = async (req, res, next) => {
  try {
    let deletedFriend = await Friend.findByIdAndRemove(req.params.id);

    const { decodedJwt } = res.locals;

    let foundUser = await User.findOne({ email: decodedJwt.email });

    let foundUserArray = foundUser.friends;

    let filteredFriendsArray = foundUserArray.filter((id) => {
      id.toString() !== deletedFriend._id.toString();
    });

    foundUser.friends = filteredFriendsArray;

    await foundUser.save();

    res.json({ message: "success", payload: deletedFriend });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getAllFriends,
  createFriend,
  updateFriendById,
  deleteFriendById,
};
