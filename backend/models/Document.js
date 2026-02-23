const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: String,
    filePath: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "pending",
    },
    publicToken: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
