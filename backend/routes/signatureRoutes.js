const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const auditMiddleware = require("../middleware/auditMiddleware");

const {
  saveSignature,
  getSignaturesByDoc,
  finalizeSignature,
  rejectDocument,
} = require("../controllers/signatureController");

// 🟢 Owner save (authenticated)
router.post("/", auth, saveSignature);

// 🔵 Public save (no auth)
router.post("/public", saveSignature);

// 🟢 Owner finalize (authenticated)
router.post("/finalize/:docId", auth, auditMiddleware, finalizeSignature);

// 🔵 Public finalize (no auth)
router.post("/public/finalize/:docId", auditMiddleware, finalizeSignature);

// Owner reject
router.post("/reject/:docId", auth, auditMiddleware, rejectDocument);
router.post("/public/reject/:docId", rejectDocument);

// Owner get signatures
router.get("/:docId", auth, getSignaturesByDoc);

module.exports = router;