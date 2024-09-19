import dotenv from "dotenv";
import { app } from "./aap.js"; // Import the app from app.js
import connectDB from "./db/index.js";

// Load environment variables
dotenv.config({
    path: './env'
});

// Connect to MongoDB
connectDB()
.then(() => {
    // Start the server once the database connection is successful
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT || 8000}`);
    });
})
.catch((error) => {
    console.log("MONGO db connection failed !!!", error);
});



/*
import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "./constants";

import express from "express"
const app = express()

( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR:", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR:", error)
        throw err
    }
})()

*/