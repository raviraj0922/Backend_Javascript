import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user._id

    const existingSubscription = await Subscription.findOne({
        user: userId,
        channel: channelId
    })

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)
        return res.status(200).json(
            new ApiResponse(200, {}, "Unsubscribed successfully")
        )
    } else {
        const newSubscription = new Subscription({
            user: userId,
            channel: channelId
        })

        await newSubscription.save()

        return res
        .status(200)
        .json(
            new ApiResponse(200, newSubscription, "Subscribed successfully")
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.aggregate([
        { 
            $match: { 
                channel: mongoose.Types.ObjectId(channelId) 
            } 
        },
        { 
            $lookup: { 
                from: 'users', 
                localField: 'user', 
                foreignField: '_id', 
                as: 'subscriber' 
            } 
        },
        { 
            $unwind: '$subscriber' 
        },
        { 
            $project: { 
                'subscriber._id': 1, 
                'subscriber.fullName': 1, 
                'subscriber.avatar': 1 
            } 
        }
    ])

    if (!subscribers || subscribers.length === 0) {
        throw new ApiError(404, "No subscribers found for this channel")
    }

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const subscriptions = await Subscription.aggregate([
        { 
            $match: { 
                user: mongoose.Types.ObjectId(subscriberId) 
            } 
        },
        { 
            $lookup: { 
                from: 'channels', 
                localField: 'channel', 
                foreignField: '_id', 
                as: 'channel' 
            } 
        },
        { 
            $unwind: '$channel' 
        },
        { 
            $project: { 
                'channel._id': 1, 
                'channel.name': 1, 
                'channel.description': 1 
            } 
        }
    ])

    if (!subscriptions || subscriptions.length === 0) {
        throw new ApiError(404, "No subscriptions found for this user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}