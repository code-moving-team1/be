import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

export async function verifyAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json({ error: "인증이 필요합니다." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(403).json({ error: "유효하지 않은 토큰입니다." });
  }
}

export default { verifyAuth };