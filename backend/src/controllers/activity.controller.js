import { Activity } from "../models/activity.model.js";
import { User } from "../models/user.model.js";

export const getRecentActivities = async (req, res) => {
    const activities = await Activity.findAll({
       include: [{ model: User, as: "user" }],
      order: [["created_at", "DESC"]],
      limit: 20
    });

    res.status(200).json(activities);
};