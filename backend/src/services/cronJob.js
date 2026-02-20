import cron from "node-cron";
import { clearUserTokens } from "../controllers/user.controller.js";

const job = cron.schedule("30 * * * *", async () => {
  console.log("Running daily maintenance tasks...");
  try {
    await clearUserTokens();
  } catch (error) {}
});

export const startCronJobs = () => {
  job.start();
};

export const stopCronJobs = () => {
  job.stop();
};
