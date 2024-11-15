import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
 
    const sortOrder = sortType === "asc" ? 1 : -1;

    const match = {};
    if (query) {
        match.title = { $regex: query, $options: "i" };
    }
    if (userId) {
        match.owner = mongoose.Types.ObjectId(userId);
    }

    const videosAggregate = await Video.aggregate([
        { $match: match },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                "ownerDetails.name": 1,
                "ownerDetails.avatar": 1
            }
        },
        { 
            $sort: { 
                [sortBy]: sortOrder 
            } 
        },
        { 
            $skip: (page - 1) * parseInt(limit) 
        },
        { 
            $limit: parseInt(limit) 
        }
    ]);

    const totalVideos = await Video.countDocuments(match);

    return res
    .status(200)
    .json(
        new ApiResponse(200, { videos: videosAggregate, totalCount: totalVideos }, "Videos retrieved successfully")
    );
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const userId = req.user._id

    if (!title || !req.file) {
        throw new ApiError(400, "Title and video file are required")
    }

    const uploadedVideo = await uploadOnCloudinary(req.file.path, "video")

    if (!uploadedVideo || !uploadedVideo.url) {
        throw new ApiError(500, "Error uploading video to Cloudinary")
    }

    const video = new Video({
        title,
        description,
        owner: userId,
        videoUrl: uploadedVideo.url,
        thumbnailUrl: uploadedVideo.thumbnail_url
    })

    await video.save()

    return res
    .status(201)
    .json(
        new ApiResponse(201, video, "Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const videoAggregate = await Video.aggregate([
        { 
            $match: { 
                _id: mongoose.Types.ObjectId(videoId) 
            } 
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { 
            $unwind: "$ownerDetails" 
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                "ownerDetails.name": 1,
                "ownerDetails.avatar": 1
            }
        }
    ]);

    if (!videoAggregate || videoAggregate.length === 0) {
        throw new ApiError(404, "Video not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, videoAggregate[0], "Video retrieved successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: 
            { 
                title, 
                description 
            } 
        },
        { 
            new: true 
        }
    )

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found")
    }

    if (req.file) {
        const uploadedThumbnail = await uploadOnCloudinary(req.file.path, "image")
        if (uploadedThumbnail && uploadedThumbnail.url) {
            updatedVideo.thumbnailUrl = uploadedThumbnail.url
            await updatedVideo.save()
        }
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(404, "Video not found")
    }

    // Optionally, delete video file from Cloudinary using its public_id
    // await deleteFromCloudinary(deletedVideo.videoPublicId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: publish status

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`)
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
