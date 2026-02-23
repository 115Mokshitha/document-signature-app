const AuditLog = require("../models/AuditLog");

module.exports = async (req, res, next) => {
  try {
    if (req.user && req.params.docId) {
      await AuditLog.create({
        documentId: req.params.docId.trim(),
        userId: req.user,
        action: req.method,
        ipAddress: req.ip,
      });
    }
    next();
  } catch (error) {
    console.error("Audit Error:", error);
    next();
  }
};
