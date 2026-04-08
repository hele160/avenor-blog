import { PostFilesDirectory } from "@/consts/consts";
import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

const contentTypeMap: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const rawPath = req.query.path;
  const segments = Array.isArray(rawPath) ? rawPath : [];

  if (segments.length === 0) {
    res.status(400).end("Missing file path");
    return;
  }

  const decodeSafely = (input: string) => {
    try {
      return decodeURIComponent(input);
    } catch {
      return input;
    }
  };

  const decodedSegments = segments.map((segment) => {
    const once = decodeSafely(segment);
    return decodeSafely(once);
  });
  const joinedPath = decodedSegments.join("/");

  if (joinedPath.includes("..") || path.isAbsolute(joinedPath)) {
    res.status(400).end("Invalid path");
    return;
  }

  const baseDir = path.join(PostFilesDirectory, "assets");
  const absolutePath = path.resolve(baseDir, joinedPath);
  const normalizedBaseDir = path.resolve(baseDir) + path.sep;

  if (!absolutePath.startsWith(normalizedBaseDir)) {
    res.status(400).end("Invalid path");
    return;
  }

  if (!fs.existsSync(absolutePath)) {
    res.status(404).end("Not found");
    return;
  }

  const extName = path.extname(absolutePath).toLowerCase();
  const contentType = contentTypeMap[extName] ?? "application/octet-stream";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  const fileBuffer = fs.readFileSync(absolutePath);
  res.status(200).send(fileBuffer);
}
