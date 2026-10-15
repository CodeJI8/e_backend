import multer from "multer";
import path from "path"; // CHANGED: filename safe রাখার জন্য
import fs from "fs"; // ADDED: folder check/create করার জন্য

const uploadDir = "uploads"; // ADDED: image save করার folder

if (!fs.existsSync(uploadDir)) { // ADDED: folder না থাকলে
  fs.mkdirSync(uploadDir, { recursive: true }); // ADDED: folder তৈরি করবে
}

const upload = multer({
  storage: multer.diskStorage({ // CHANGED: memoryStorage → diskStorage
    destination: uploadDir, // ADDED: image uploads/ folder-এ save হবে
    filename: (req, file, cb) => { // ADDED: saved filename নির্ধারণ
      cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // আগের মতোই: সর্বোচ্চ 5 MB
  },
  fileFilter: (req, file, cb) => { // আগের মতোই
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export default upload;