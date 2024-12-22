import fs from "fs";
import path from "path";
import { UploadHandler } from "@remix-run/node";

export const createDiskUploadHandler = ({
  uploadDir, // Directory where files will be stored
}: {
  uploadDir: string;
}): UploadHandler => {
  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return async ({ name, contentType, data, filename }) => {
    // Skip if not a file or no filename
    if (!filename) {
      const chunks = [];
      for await (const chunk of data) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks).toString();
    }

    // Create a buffer from the incoming stream
    const chunks = [];
    for await (const chunk of data) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Generate a unique filename using timestamp
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}-${filename}`;

    // Full path to the file
    const filePath = path.join(uploadDir, uniqueFilename);

    // Write the file to disk
    fs.writeFileSync(filePath, buffer);

    // Return the file path (or a URL if you want to serve it)
    return filePath;
  };
};
