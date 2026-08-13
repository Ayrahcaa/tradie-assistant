import fs from "node:fs";
import path from "node:path";
import multer from "multer";
const uploadDirectory = path.resolve(process.cwd(), "uploads", "receipts");
fs.mkdirSync(uploadDirectory, {
    recursive: true,
});
const storage = multer.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (_request, file, callback) => {
        const extension = path.extname(file.originalname);
        const uniqueName = `${crypto.randomUUID()}${extension}`;
        callback(null, uniqueName);
    },
});
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
]);
export const receiptUpload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (_request, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            callback(new Error("Only JPG, PNG, WEBP and PDF receipts are supported."));
            return;
        }
        callback(null, true);
    },
});
//# sourceMappingURL=receipt.upload.js.map