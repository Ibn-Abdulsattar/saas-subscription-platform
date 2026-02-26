import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';
import ExpressError from '../utils/expressError.js';
import wrapAsync from '../utils/wrapAsync.js';

dotenv.config();

export const sequelize = new Sequelize (process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions:{
        ssl: false,
        // {
        //     require:true,
        //     rejectUnauthorize: false,
        // },
    },
    logging: false,
});

export const connectDB = async()=>{
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        await sequelize.sync({alter: true});
        console.log('Database synced successfully');
    } catch (error) {
        console.log('Database connected successfully', error);
        throw new ExpressError('Database connection failed', 500);
    }
};

export const disconnectDB = wrapAsync(async () => {
  const disconnect = await sequelize.close();
  if (!disconnect) {
    throw new ExpressError(
      "Unable to close the database connection",
      500
    );
  }
  console.log("Database connection closed.");
});

process.removeAllListeners("SIGINT");
process.on('SIGINT', async()=>{
    await disconnectDB();
  console.log("Process Signal Interrupt terminated");
    process.exit(0);
})

process.removeAllListeners("SIGTERM");
process.on("SIGTERM", async () => {
  await disconnectDB();
  console.log("Process Signal Terminate terminated");
  process.exit(0);
});