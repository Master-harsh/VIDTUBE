import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect("Your mongoDB URL here");
        
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}

export default connectDB;
