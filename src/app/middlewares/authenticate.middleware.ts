// middleware/authenticateToken.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { AuthenticatedRequest } from "../types";
// Load environment variables from .env file
dotenv.config();
const secretKey = process.env.ACCESS_TOKEN_SECRET || "your-secret-key"; // Use an environment variable for the secret key

const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Token Required" });
  }

  // Verify and decode the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log("ddddddd",err);
      return res.status(440).json({ message: "401" });
    }
    // Attach the decoded data to the request object
    req.user = decoded;
    next();
  });
};

export default authenticateToken;
