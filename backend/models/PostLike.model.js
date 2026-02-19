import mongoose from "mongoose";

const postLikeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// ✅ 1 like per user per post
postLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.model("PostLike", postLikeSchema);
