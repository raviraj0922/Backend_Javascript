import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.params.channelId;

    const channelExists = await Video.findOne({ owner: channelId });
    if (!channelExists) {
        throw new ApiError(404, "Channel not found");
    }

    const [videoStats, subscriberCount, likeCount] = await Promise.all([
        // Calculate total video count and total views
        Video.aggregate([
            { $match: { owner: mongoose.Types.ObjectId(channelId) } },
            {
                $group: {
                    _id: "$owner",
                    totalViews: { $sum: "$views" },
                    totalVideos: { $sum: 1 },
                },
            },
        ]),

        Subscription.countDocuments({ channel: channelId }),
        Like.countDocuments({ videoOwner: channelId }),
    ]);

    const stats = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalSubscribers: subscriberCount,
        totalLikes: likeCount,
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, stats, "Channel statistics retrieved successfully")
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const videos = await Video.find({ owner: channelId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments({ owner: channelId });

    const response = {
        videos,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalVideos / limit),
            totalVideos,
        },
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "Channel videos retrieved successfully")
    );
})

export {
    getChannelStats, 
    getChannelVideos
    }