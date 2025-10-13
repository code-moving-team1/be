// src/middlewares/auth.ts
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

//(우진수정) 지금은 쿠키에서 토큰 꺼네는것만 있는데
//헤더에서 쿠키꺼내는 로직도 추가합니다(서버사이드용)

function getBearerFromAuthz(req: Request): string | undefined {
  // authorization / Authorization 모두 방어
  const authz = (req.headers["authorization"] ??
    (req.headers as any)["Authorization"]) as string | undefined;

  if (!authz) return undefined;
  if (!authz.startsWith("Bearer ")) return undefined;
  return authz.slice(7).trim();
}

export async function verifyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  //1순위 쿠키에서 토큰
  const cookieToken = req.cookies.accessToken;
  // const token = req.cookies.accessToken;

  // Authorization 헤더(Bearer) 에서의 토큰도 허용
  const headerToken = getBearerFromAuthz(req);
  const token = cookieToken ?? headerToken;

  if (!token) return res.status(401).json({ error: "인증이 필요합니다." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      userType?: "CUSTOMER" | "MOVER";
    };
    req.user = { id: decoded.id, userType: decoded.userType };
    next();
  } catch {
    res.status(403).json({ error: "유효하지 않은 토큰입니다." });
  }
}

export default { verifyAuth };
