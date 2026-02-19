import { Router } from "express";
import PostModel from "../models/Post.model.js";
import { AuthMiddleware } from "../middleware/Auth.middleware.js";

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
