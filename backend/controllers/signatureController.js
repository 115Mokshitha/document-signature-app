const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const Document = require("../models/Document");
const Signature = require("../models/Signature");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// ✅ 1. Global Transporter (Configured for mokshithav115@gmail.com via .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // ⬇️ ADD THIS PART ⬇️
  tls: {
    rejectUnauthorized: false
  }
});

// 2. Save Signature (With Audit Trail)
exports.saveSignature = async (req, res) => {
  try {
    const { documentId, x, y, page, signatureImage } = req.body;
    const document = await Document.findById(documentId.trim());

    if (!document) return res.status(404).json({ message: "Document not found" });
    if (document.status === "signed") return res.status(400).json({ message: "Document already signed" });

    // ✅ Get IP and Browser info for the Audit Trail
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const signature = await Signature.create({
      documentId: documentId.trim(),
      userId: req.user ? req.user._id : null,
      x,
      y,
      page,
      signatureImage,
      ipAddress,
      userAgent,
    });

    res.status(201).json(signature);
  } catch (error) {
    res.status(500).json({ message: "Error saving signature" });
  }
};

// 3. Get Signatures
exports.getSignaturesByDoc = async (req, res) => {
  try {
    const signatures = await Signature.find({ documentId: req.params.docId.trim() });
    res.json(signatures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching signatures" });
  }
};

// 4. Finalize & Embed (Multi-Page & Email Support)
exports.finalizeSignature = async (req, res) => {
  try {
    const docId = req.params.docId.trim();
    const document = await Document.findById(docId);
    
    if (!document) return res.status(404).json({ message: "Document not found" });
    if (document.status === "signed") return res.status(400).json({ message: "Document already signed" });
    
    const ownerUser = await User.findById(document.owner);

    const fullPath = path.resolve(__dirname, "..", document.filePath);
    const pdfDoc = await PDFDocument.load(fs.readFileSync(fullPath));
    const pages = pdfDoc.getPages();
    const signatures = await Signature.find({ documentId: docId });

    if (signatures.length === 0) return res.status(400).json({ message: "No signatures found" });

    for (const sig of signatures) {
      // ✅ MULTI-PAGE FIX: Ensure the page exists in the PDF
      const pageIndex = sig.page - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) {
        console.warn(`Signature page ${sig.page} out of bounds for document.`);
        continue; 
      }

      const page = pages[pageIndex];
      const { width: pdfWidth, height: pdfHeight } = page.getSize();
      const scale = pdfWidth / 600;

      const xPos = sig.x * scale;
      const yPos = pdfHeight - (sig.y * scale) - (48 * scale);

      if (sig.signatureImage) {
        const base64Data = sig.signatureImage.split(",")[1];
        const imageBytes = Buffer.from(base64Data, "base64");
        const embeddedImage = await pdfDoc.embedPng(imageBytes);

        page.drawImage(embeddedImage, {
          x: xPos,
          y: yPos,
          width: 128 * scale,
          height: 48 * scale,
        });

        // ✅ ADD AUDIT TRAIL TEXT UNDER THE IMAGE
        const auditDate = sig.createdAt ? new Date(sig.createdAt).toLocaleString() : new Date().toLocaleString();
        page.drawText(
          `Verified: ${auditDate} | IP: ${sig.ipAddress || 'Unknown'}`,
          {
            x: xPos,
            y: yPos - (10 * scale),
            size: 6 * scale,
            color: rgb(0.5, 0.5, 0.5),
          }
        );
      } else {
        // Owner digital signature (TEXT) logic
        page.drawRectangle({
          x: xPos,
          y: yPos,
          width: 260 * scale,
          height: 60 * scale,
          borderWidth: 1,
          borderColor: rgb(0, 0, 0),
        });

        page.drawText(`Digitally Signed by ${ownerUser.name || ownerUser.email}`, {
          x: xPos + 10 * scale,
          y: yPos + 35 * scale,
          size: 14 * scale,
          color: rgb(0, 0.4, 0),
        });

        page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
          x: xPos + 10 * scale,
          y: yPos + 15 * scale,
          size: 10 * scale,
          color: rgb(0, 0, 0),
        });
      }
    }

    const signedPdfBytes = await pdfDoc.save();
    const signedFileName = `signed-${Date.now()}.pdf`;
    const signedPath = path.resolve(__dirname, "..", "uploads", signedFileName);
    fs.writeFileSync(signedPath, signedPdfBytes);

    document.filePath = `uploads/${signedFileName}`;
    document.status = "signed";
    await document.save();

    // ✅ AUTOMATED EMAIL NOTIFICATION
    const mailOptions = {
      from: `"SignFlow Vault" <${process.env.EMAIL_USER}>`,
      to: 'mokshithav115@gmail.com', // Direct to your real inbox
      subject: `✅ Document Finalized: ${document.title}`,
      text: `Hello Mokshitha,\n\nYour document "${document.title}" has been signed. Find the attached copy below.`,
      attachments: [{ filename: signedFileName, path: signedPath }]
    };

    transporter.sendMail(mailOptions).catch(err => console.error("Email failed:", err));

    res.json({ message: "Signed successfully and email sent", signedFile: document.filePath });
  } catch (error) {
    console.error("Finalize Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 5. Reject Logic
exports.rejectDocument = async (req, res) => {
  try {
    const { reason } = req.body;
    const document = await Document.findById(req.params.docId.trim());

    if (!document) return res.status(404).json({ message: "Document not found" });
    if (document.status === "signed") return res.status(400).json({ message: "Cannot reject a signed document" });

    document.status = "rejected";
    document.rejectionReason = reason; // Ensure this field exists in your Document model
    await document.save();

    // ✅ Notify you via email about the rejection
    const mailOptions = {
      from: `"SignFlow" <${process.env.EMAIL_USER}>`,
      to: 'mokshithav115@gmail.com', // Your real inbox
      subject: `❌ Document Rejected: ${document.title}`,
      text: `Hello Mokshitha,\n\nThe document "${document.title}" was rejected.\n\nReason: ${reason}`,
    };

    transporter.sendMail(mailOptions).catch(err => console.error("Rejection email failed:", err));

    res.json({ message: "Document rejected and notification sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
