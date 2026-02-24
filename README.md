# Document Signature App

A full-stack MERN application for digital and electronic PDF signing with signature placement, public link signing, and secure PDF embedding.

## 🚀 Features

- Upload PDF documents
- Drag & lock signature placement
- Digital signature stamping (Owner)
- Public link electronic signature
- PDF modification using pdf-lib
- Authentication & authorization
- Audit logging
- Signed document download

## 🛠 Tech Stack

**Frontend**
- React (Vite + TypeScript)
- Tailwind CSS
- React PDF
- DnD Kit

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- pdf-lib

## 📂 Project Structure
document-signature-app
├── backend
│ ├── controllers
│ ├── models
│ ├── routes
│ ├── middleware
│ └── server.js
└── my-signature-app
├── src
├── components
├── pages
└── main.tsx
### 2️⃣ Backend Setup
cd backend
npm install
npm run dev


### 3️⃣ Frontend Setup


cd my-signature-app
npm install
npm run dev


---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder:


MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


