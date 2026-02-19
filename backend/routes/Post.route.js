import { Router } from "express";
import PostModel from "../models/Post.model.js";
import { AuthMiddleware } from "../middleware/Auth.middleware.js";
import mongoose from "mongoose";
import PostLikeModel from "../models/PostLike.model.js";

export const PostRouter = Router();

// Create post (requires login)
PostRouter.post("/", AuthMiddleware, async (req, res) => {
  try {
    const { content, media } = req.body;

    if (!content) {
      return res.status(400).json({ message: "content is required" });
    }

    const post = await PostModel.create({
      userId: req.user.id,
      content,
      media: media || "",
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all active posts
PostRouter.get("/", async (req, res) => {
  try {
    const posts = await PostModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate("userId", "username name surname");

    return res.json(posts);
  } catch (err) {
    console.error("GET POSTS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update post (only owner)
PostRouter.patch("/:id", AuthMiddleware, async (req, res) => {
  try {
    const { content, media } = req.body;

    if (!content && media === undefined) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (String(post.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (content) post.content = content;
    if (media !== undefined) post.media = media;

    await post.save();

    return res.json({ message: "Post updated successfully", post });
  } catch (err) {
    console.error("UPDATE POST ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Soft delete (only owner)
PostRouter.delete("/:id", AuthMiddleware, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (String(post.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    post.isActive = false;
    await post.save();

    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Toggle like/unlike
PostRouter.post("/:id/like", AuthMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await PostModel.findOne({ _id: postId, isActive: true });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = await PostLikeModel.findOne({ postId, userId });

    if (existing) {
      await PostLikeModel.deleteOne({ _id: existing._id });
      const updated = await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: -1 } },
        { new: true },
      );

      return res.json({
        postId,
        liked: false,
        likesCount: updated.likesCount,
      });
    } else {
      await PostLikeModel.create({ postId, userId });
      const updated = await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: 1 } },
        { new: true },
      );

      return res.json({
        postId,
        liked: true,
        likesCount: updated.likesCount,
      });
    }
  } catch (err) {
    console.error("LIKE TOGGLE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
