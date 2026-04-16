import { Router } from "express";
import auth from "../middlewares/auth.js";
import wrapAsync from "../utils/wrapAsync.js";
import {
  addMembersToTeam,
  createTeam,
  getAllMembersOfTeam,
  getAllTeams,
} from "../controllers/team.controller.js";
const router = Router();

router.route("/").post(auth(["manager", "admin"]), wrapAsync(createTeam));
router
  .route("/:teamId/members")
  .post(auth(["manager", "admin"]), wrapAsync(addMembersToTeam))
  .get(auth(["manager", "admin"]), wrapAsync(getAllMembersOfTeam));
router.route("/all-teams").get(auth(["manager", "admin"]), wrapAsync(getAllTeams))
export default router;
