import mongoose from "mongoose";

const twoFactorCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

twoFactorCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("TwoFactorCode", twoFactorCodeSchema);
