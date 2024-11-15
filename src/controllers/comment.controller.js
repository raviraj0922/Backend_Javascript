import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const skip = (page - 1) * limit;
    const commentsData = await Comment.aggregate([
        { $match: { video: videoId } }, 
        { $sort: { createdAt: -1 } }, 
        {
            $facet: {
                comments: [
                    { $skip: skip },
                    { $limit: Number(limit) },
                    {
                        $lookup: {
                            from: 'users', // Adjust 'users' if your collection name is different
                            localField: 'user',
                            foreignField: '_id',
                            as: 'userDetails'
                        }
                    },
                    {
                        $unwind: '$userDetails' // Unwind the user details array
                    },
                    {
                        $project: {
                            content: 1,
                            createdAt: 1,
                            'userDetails.username': 1,
                            'userDetails.avatar': 1
                        }
                    }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        },
        {
            $addFields: {
                totalCount: { $arrayElemAt: ["$totalCount.count", 0] }
            }
        }
    ])
     // Extract results from aggregation output
     const comments = commentsData[0]?.comments || [];
     const totalCount = commentsData[0]?.totalCount || 0;
     const totalPages = Math.ceil(totalCount / limit);

     return res
     .status(200)
     .json({
        success: true,
        comments,
        pagination: {
            currentPage: page,
            totalPages,
            totalComments: totalCount,
        },
    })

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!videoId || !content) {
        throw new ApiError(400, "Video ID and comment content are required");
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: userId,
    });

    const populatedComment = await Comment.findById(newComment._id)
        .populate("owner", "username avatar")
        .populate("video", "title");

    return res
    .status(200)
    .json(new ApiResponse(200, populatedComment, "Comment added successfully")
    );
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.findOne({ _id: commentId, owner: userId });
    if (!comment) {
        throw new ApiError(404, "Comment not found or user not authorized to update");
    }

    comment.content = content;
    await comment.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findOne({ _id: commentId, owner: userId });
    if (!comment) {
        throw new ApiError(404, "Comment not found or user not authorized to delete");
    }

    await Comment.deleteOne({ _id: commentId });

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
