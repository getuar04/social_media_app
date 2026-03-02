// import multer from "multer";
// import path from "path";

// const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) =>
//     cb(null, Date.now() + path.extname(file.originalname)),
// });

// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (allowedExt.includes(ext)) cb(null, true);
//   else cb(new Error("Only images are allowed"), false);
// };

// export const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter,
// });

import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({storage});