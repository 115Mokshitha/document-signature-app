const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadDocument,
  getUserDocs,
  getDocumentByToken,
  getDocumentById,
  deleteDocument
} = require("../controllers/docController");

router.post("/upload", auth, upload.single("file"), uploadDocument);
router.get("/", auth, getUserDocs);
router.get("/public/:token", getDocumentByToken);
router.get("/:id", auth, getDocumentById);
router.delete("/:id", auth, deleteDocument);

module.exports = router;
