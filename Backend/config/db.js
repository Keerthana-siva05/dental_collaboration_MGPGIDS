
import { connect } from "mongoose";

const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit process if connection fails
  }
};

export default connectDB;
