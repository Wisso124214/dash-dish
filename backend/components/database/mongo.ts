import mongoose from "mongoose";

export class Database {
  async connect(
    uri: string,
    options?: mongoose.ConnectOptions
  ) {
    try {
      await mongoose.connect(uri, options);
      console.log("MongoDB connected");
    } catch (error) {
      console.error("MongoDB connection error:", error);
    }
  }
}