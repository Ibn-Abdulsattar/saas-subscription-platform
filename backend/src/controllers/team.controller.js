import { Team } from "../models/team.model.js";
import { TeamMembers } from "../models/teamMembers.model.js";
import { User } from "../models/user.model.js";
import ExpressError from "../utils/expressError.js";

export const createTeam = async (req, res, next) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return next(new ExpressError("Name and Description are required", 400));
  }

  const team = await Team.create({ name, description });

  return res
    .status(201)
    .json({ message: "Team created successfully!", data: team });
};

export const addMembersToTeam = async (req, res, next) => {
  const { teamId } = req.params;
  const { userIds } = req.body;

  if (!teamId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(
      new ExpressError("teamId and userIds (array) are reauired", 400),
    );
  }

  const team = await Team.findByPk(teamId);

  if (!team) {
    return next(new ExpressError("Team not found!", 404));
  }
console.log("userIsds", userIds);
  await TeamMembers.bulkCreate(
    userIds.map((userId) => ({
      teamId,
      userId,
    })),
  );

  return res
    .status(200)
    .json({ message: "Members added to team successfully!" });
};

export const getAllMembersOfTeam = async (req, res, next) => {
  const { teamId } = req.params;

  const team = await Team.findByPk(teamId);

  if (!team) {
    return next(new ExpressError("Team not found!", 404));
  }

  const members = await TeamMembers.findAll({
    where: { teamId },
    include: {
      model: User,
      attributes: ["user_id", "username", "email", "role", "jobTitle"],
      as: "user",
    },
  });
  console.log(members);
  res.status(200).json({ members: members });
};

export const getAllTeams = async(req, res, next)=>{
  const teams = await Team.findAll({
    include:[
      {
        model: User,
        as: "users", attributes: ["user_id", "username", "email"]} 
    ]
  })

  return res.status(200).json({teams});
}
