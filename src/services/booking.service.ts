// src/services/booking.service.ts
import bookingRepo from "../repositories/booking.repository";

const getReviewables = async (
  customerId: number,
  opts: { page: number; pageSize: number }
) => {
  return bookingRepo.findReviewablesByCustomer(customerId, opts);
};

export default { getReviewables };
