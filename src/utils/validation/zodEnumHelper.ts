// src/utils/validation/zodEnumHelper.ts
import { z } from "zod";

export function createZodEnum<T extends string>(obj: Record<string, T>) {
  return z.enum(Object.values(obj) as [T, ...T[]]);
}
//@TODO enum에 없을시 에러처리 태홍님꺼 적용필요