import { User } from "../models/user.model.js";
import Cloudinary from "../utils/cloudinary.js";
import ExpressError from "../utils/expressError.js";

export const profile = async (req, res, next) => {
  const { user } = req;
  const userData = await User.findByPk(user.user_id, {
    attributes: ["user_id", "username", "email", "avatar_url", "role","createdAt"],
  });

  res.status(200).json({ user: userData });
};

export const updateProfile = async (req, res, next) => {
  const { username } = req.body;
  const userId = req.user.user_id;

  let avatar_url = req.user.avatar_url;

  const file = req.file;
  if (file) {
    try {
      const result = await Cloudinary(file);

      avatar_url = result.secure_url;
    } catch (err) {
      return next(new ExpressError("Image upload failed", 500));
    }
  }

  const [rowsAffected, updatedUser] = await User.update(
    {
      avatar_url: avatar_url,
      username: username,
    },
    {
      where: { user_id: userId },
      attributes: { exclude: ["password"] },
      returning: true,
      plain: true,
    },
  );

  if (rowsAffected === 0) {
    return next(new ExpressError( "User not found or no changes made", 404));
  }

  return res
    .status(200)
    .json({ message: "Profile Updated successfuly!", user: updatedUser });
};
