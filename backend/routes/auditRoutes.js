const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getAuditLogs } = require("../controllers/auditController");

router.get("/:docId", auth, getAuditLogs);

module.exports = router;
