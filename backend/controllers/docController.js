// const Document = require("../models/Document");
// const { v4: uuidv4 } = require("uuid");

// exports.uploadDocument = async (req, res) => {
//   try {
//     const newDoc = await Document.create({
//       // Use req.body.title if it exists, otherwise use the filename
//       title: req.body.title || req.file.originalname, 
//       filePath: req.file.path,
//       owner: req.user,
//       publicToken: uuidv4(),
//     });

//     res.status(201).json(newDoc);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getUserDocs = async (req, res) => {
//   try {
//     const docs = await Document.find({ owner: req.user });
//     res.json(docs);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getDocumentById = async (req, res) => {
//   try {
//     const document = await Document.findById(req.params.id);
//     if (!document) {
//       return res.status(404).json({ message: "Document not found" });
//     }
//     if (document.owner.toString() !== req.user) {
//       return res.status(403).json({ message: "Unauthorized access" });
//     }
//     res.json(document);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Ensure you also have getDocumentByToken if you're using it in routes
// exports.getDocumentByToken = async (req, res) => {
//   try {
//     const document = await Document.findOne({ publicToken: req.params.token });
//     if (!document) return res.status(404).json({ message: "Invalid link" });
//     res.json(document);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const fs = require('fs');
// const path = require('path');

// // exports.deleteDocument = async (req, res) => {
// //   try {
// //     const document = await Document.findById(req.params.id);
// //     if (!document) return res.status(404).json({ message: "Document not found" });

// //     // 1. Delete the physical file from the uploads folder
// //     const filePath = path.join(__dirname, '..', document.filePath);
// //     if (fs.existsSync(filePath)) {
// //       fs.unlinkSync(filePath);
// //     }

// //     // 2. Remove the record from MongoDB
// //     await Document.findByIdAndDelete(req.params.id);

// //     res.json({ message: "Document deleted successfully" });
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };
// exports.deleteDocument = async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ message: "Document not found" });

//     // 1. Delete physical file from the server uploads folder
//     const filePath = path.resolve(__dirname, '..', doc.filePath);
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     // 2. Remove document and all its signatures from database
//     await Document.findByIdAndDelete(req.params.id);
//     await Signature.deleteMany({ documentId: req.params.id });

//     res.json({ message: "Document deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error during deletion" });
//   }
// };
const Document = require("../models/Document");
const Signature = require("../models/Signature"); // ✅ ADD THIS IMPORT
const { v4: uuidv4 } = require("uuid");
const fs = require('fs');
const path = require('path');

exports.uploadDocument = async (req, res) => {
  try {
    const newDoc = await Document.create({
      title: req.body.title || req.file.originalname, 
      filePath: req.file.path,
      owner: req.user,
      publicToken: uuidv4(),
    });
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserDocs = async (req, res) => {
  try {
    // ✅ Use .lean() and a manual lookup or .populate if you have refs set up
    // This ensures signatures are sent to the dashboard
    const docs = await Document.find({ owner: req.user }).sort({ createdAt: -1 });
    
    // Attach the latest signature to each document for the dashboard view
    const docsWithSigs = await Promise.all(docs.map(async (doc) => {
      const signatures = await Signature.find({ documentId: doc._id }).limit(1);
      return { ...doc._doc, signatures };
    }));

    res.json(docsWithSigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });
    if (document.owner.toString() !== req.user) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocumentByToken = async (req, res) => {
  try {
    const document = await Document.findOne({ publicToken: req.params.token });
    if (!document) return res.status(404).json({ message: "Invalid link" });
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document already removed" });

    // 1. Delete physical file from the server uploads folder
    const filePath = path.resolve(__dirname, '..', doc.filePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("File system delete error:", err);
      }
    }

    // 2. Remove document and all its signatures from database
    await Document.findByIdAndDelete(req.params.id);
    await Signature.deleteMany({ documentId: req.params.id });

    res.json({ message: "Document and associated data deleted successfully" });
  } catch (err) {
    console.error("Delete Controller Error:", err);
    res.status(500).json({ message: "Error during deletion" });
  }
};