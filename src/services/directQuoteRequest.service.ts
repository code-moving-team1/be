import directQuoteRequestRepo from "../repositories/directQuoteRequest.repository";
import { prisma } from "../lib/prisma";
import { createError } from "../utils/HttpError";

const getById = async (id: number) => {
  const result = await directQuoteRequestRepo.getById(id);
  return result;
};

const getListByCustomer = async (customerId: number) => {
  const result = await directQuoteRequestRepo.getListByCustomer(customerId);
  return result;
};

const getRejectedListByMover = async (moverId: number) => {
  const result = await directQuoteRequestRepo.getRejectedListByMover(moverId);
  return result;
};

const create = async (moveRequestId: number, moverId: number) => {
  const result = await directQuoteRequestRepo.create(moveRequestId, moverId);
  return result;
};

const updateToAccepted = async (id: number) => {
  const result = await directQuoteRequestRepo.update(id, "ACCEPTED");
  return result;
};

const updateToRejected = async (id: number, comment: string) => {
  // 트랜잭션을 사용하여 모든 작업을 원자적으로 처리
  // 하나라도 실패하면 모든 작업이 롤백됨
  try {
    const result = await prisma.$transaction(async (tx) => [
      await directQuoteRequestRepo.update(id, "REJECTED"),
      await directQuoteRequestRepo.createRejectedRequest(comment, id),
    ]);
    return result;
  } catch (error) {
    throw createError("SERVER/INTERNAL", {
      messageOverride: "반려 중 트랜잭션 오류로 요청이 취소되었습니다.",
    });
  }
};

const updateToExpired = async (id: number) => {
  const result = await directQuoteRequestRepo.update(id, "EXPIRED");
  return result;
};

export default {
  getById,
  getListByCustomer,
  getRejectedListByMover,
  create,
  updateToAccepted,
  updateToRejected,
  updateToExpired,
};
