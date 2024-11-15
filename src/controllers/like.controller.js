import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({ 
        video: videoId, 
        likedBy: userId 
    });

    if (existingLike) {
        await Like.deleteOne({ 
            _id: existingLike._id 
        });
        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Like removed from video"));
    } else {
        await Like.create({ 
            video: videoId, 
            likedBy: userId 
        });
        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video liked successfully"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({ 
        comment: commentId, 
        likedBy: userId 
    });

    if (existingLike) {
        await Like.deleteOne({ 
            _id: existingLike._id 
        });
        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Like removed from comment"));
    } else {
        await Like.create({ 
            comment: commentId, 
            likedBy: userId 
        });
        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment liked successfully"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({ 
        tweet: tweetId, 
        likedBy: userId 
    });

    if (existingLike) {
        await Like.deleteOne({ 
            _id: existingLike._id 
        });
        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Like removed from tweet"));
    } else {
        await Like.create({ 
            tweet: tweetId, 
            likedBy: userId 
        });
        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet liked successfully"));
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id;
    const likedVideos = await Like.aggregate([
        { 
            $match: { 
                likedBy: userId 
            } 
        },
        { 
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        { 
            $unwind: "$videoDetails" 
        }, 
        { 
            $project: { 
                "videoDetails._id": 1,
                "videoDetails.title": 1,
                "videoDetails.thumbnail": 1 
            } 
        }
    ]);

    if (!likedVideos || likedVideos.length === 0) {
        return res
        .status(404)
        .json(new ApiResponse(404, {}, "No liked videos found"));
    }

    return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}