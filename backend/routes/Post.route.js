import { Router } from "express";
import mongoose from "mongoose";
import PostModel from "../models/Post.model.js";
import PostLikeModel from "../models/PostLike.model.js";
import { upload } from "../middleware/Multer.middleware.js";
import { AuthMiddleware } from "../middleware/Auth.middleware.js";
import { verifyToken } from "../util/token.js";
import { imagekit } from "../util/imagekit.js";

const PostRouter = Router();

// Get posts (public) + pagination + likedByMe if token exists
PostRouter.get("/", async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      filter.user = req.query.userId;
    }

    let viewerUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        try {
          const decoded = verifyToken(parts[1]);
          if (decoded?.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
            viewerUserId = decoded.id;
          }
        } catch {}
      }
    }

    const [posts, total] = await Promise.all([
      PostModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username name surname"),
      PostModel.countDocuments(filter),
    ]);

    // likedByMe for current page
    let likedSet = new Set();
    if (viewerUserId && posts.length > 0) {
      const postIds = posts.map((p) => p._id);
      const likes = await PostLikeModel.find({
        userId: viewerUserId,
        postId: { $in: postIds },
      }).select("postId");
      likedSet = new Set(likes.map((l) => String(l.postId)));
    }

    const shaped = posts.map((p) => {
      const obj = p.toObject();
      obj.likedByMe = likedSet.has(String(p._id));
      return obj;
    });

    return res.json({
      data: shaped,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log("GET POSTS ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   CREATE POST WITH MULTER
============================ */

PostRouter.post(
  "/",
  AuthMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: `${Date.now()}_${req.file.originalname}`,
        folder: "posts",
      });

      const imageUrl = result?.url;

      const post = await PostModel.create({
        user: req.user.id,
        content,
        imageUrl,
      });

      const populated = await post.populate("user", "username name surname");
      const obj = populated.toObject();
      obj.likedByMe = false;
      res.status(201).json(obj);
    } catch (error) {
      console.log("CREATE POST ERROR:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Update post (owner only)
PostRouter.patch("/:id", AuthMiddleware, async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await PostModel.findById(req.params.id);
    if (!post || !post.isActive) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (String(post.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    post.content = String(content).trim();
    await post.save();

    const populated = await post.populate("user", "username name surname");
    return res.json({ message: "Post updated successfully", post: populated });
  } catch (error) {
    console.log("UPDATE POST ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Soft delete (owner only)
PostRouter.delete("/:id", AuthMiddleware, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post || !post.isActive) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (String(post.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    post.isActive = false;
    await post.save();

    return res.json({ message: "Post deleted" });
  } catch (error) {
    console.log("DELETE POST ERROR:", error);
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
        likesCount: updated?.likesCount ?? 0,
      });
    }

    await PostLikeModel.create({ postId, userId });
    const updated = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true },
    );

    return res.json({
      postId,
      liked: true,
      likesCount: updated?.likesCount ?? 0,
    });
  } catch (error) {
    console.log("LIKE TOGGLE ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default PostRouter;
