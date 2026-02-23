// const mongoose = require("mongoose");

// const signatureSchema = new mongoose.Schema(
//   {
//     documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     x: Number,
//     y: Number,
//     page: Number,
//     // --- ADD THIS FIELD ---
//     signatureImage: { 
//       type: String, 
//       required: false // Optional, as some old docs might only have text
//     },
//     status: {
//       type: String,
//       enum: ["pending", "signed", "rejected"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Signature", signatureSchema);
const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    x: Number,
    y: Number,
    page: Number,
    signatureImage: { 
      type: String, 
      required: false 
    },
    // ✅ NEW AUDIT TRAIL FIELDS
    ipAddress: {
      type: String,
      required: false
    },
    userAgent: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true } // ✅ This already tracks the "signedAt" time via createdAt
);

module.exports = mongoose.model("Signature", signatureSchema);