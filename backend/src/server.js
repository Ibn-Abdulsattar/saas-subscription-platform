import {app} from "./app.js";
import { connectDB } from "./config/db.js";
import { startCronJobs, stopCronJobs } from "./services/cronJob.js";
import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

const PORT = app.get('PORT');

async function startApp() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    console.log("CORS Origin:", process.env.FRONTEND_URL);
    startCronJobs();
  } catch (err) {
    console.error("💥 Shutdown: DB connection failed", err);
    process.exit(1);
    stopCronJobs();
  }
}

startApp();
