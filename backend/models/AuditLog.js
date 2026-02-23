const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: String,
    ipAddress: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditSchema);
