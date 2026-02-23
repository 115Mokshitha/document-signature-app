const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res) => {
  const logs = await AuditLog.find({
    documentId: req.params.docId,
  });

  res.json(logs);
};
