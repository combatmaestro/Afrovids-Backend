import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const DB_URL = process.env.DB_URL;
export const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${DB_URL}/afrovids`)

        console.log(`MongoDB connected || DB host ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("failed to connect to database",error);
        process.exit(1);
    }   
}
