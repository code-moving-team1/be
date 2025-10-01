import id from "zod/v4/locales/id.js";
import directQuoteRequestRepo from "../repositories/directQuoteRequest.repository";

const create = async (moveRequestId: number, moverId: number) => {
  const result = await directQuoteRequestRepo.create(moveRequestId, moverId);
  return result;
};

const updateToAccepted = async (id: number) => {
  const result = await directQuoteRequestRepo.update(id, "ACCEPTED");
};

// @TODO 거절 관련해서 제대로 작성 안 되어 있음. 수정 필요
const updateToRejected = async (id: number) => {
  const result = await directQuoteRequestRepo.update(id, "REJECTED");
  return result;
};

const updateToExpired = async (id: number) => {
  const result = await directQuoteRequestRepo.update(id, "EXPIRED");
  return result;
};

export default {
  create,
  updateToAccepted,
  updateToRejected,
  updateToExpired,
};
