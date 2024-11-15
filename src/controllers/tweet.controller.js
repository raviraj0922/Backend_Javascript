import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    const userId = req.user._id

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }

    const newTweet = new Tweet({
        content,
        owner: userId
    })

    await newTweet.save()

    return res
    .status(201)
    .json(
        new ApiResponse(201, newTweet, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 })

    if (!tweets || tweets.length === 0) {
        throw new ApiError(404, "No tweets found for this user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, "User tweets retrieved successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    const userId = req.user._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findOne({ 
        _id: tweetId,
        owner: userId 
    })
    if (!tweet) {
        throw new ApiError(404, "Tweet not found or user is not authorized to edit")
    }

    tweet.content = content
    await tweet.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    const userId = req.user._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const deletedTweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: userId
    })

    if (!deletedTweet) {
        throw new ApiError(404, "Tweet not found or user is not authorized to delete")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
