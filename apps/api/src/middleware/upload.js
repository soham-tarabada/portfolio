import multer from "multer";
import { badRequest } from "../utils/httpError.js";

const MAX_BYTES = 5 * 1024 * 1024;

const handler = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(req, file, callback) {
    if (file.mimetype !== "application/pdf") {
      callback(badRequest("Only PDF files are accepted.", "INVALID_FILE_TYPE"));
      return;
    }
    callback(null, true);
  },
}).single("file");

export function uploadPdf(req, res, next) {
  handler(req, res, (error) => {
    if (!error) return next();

    if (error.code === "LIMIT_FILE_SIZE") {
      return next(badRequest("The file must be 5 MB or smaller.", "FILE_TOO_LARGE"));
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return next(badRequest('Send the PDF in a field named "file".', "UNEXPECTED_FIELD"));
    }

    return next(error);
  });
}
