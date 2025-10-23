import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class LikesRepository {
  // 좋아요 생성
  static async create(customerId: number, moverId: number) {
    return await prisma.likes.create({
      data: {
        customerId,
        moverId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mover: {
          select: {
            id: true,
            name: true,
            nickname: true,
            img: true,
            averageRating: true,
            totalReviews: true,
          },
        },
      },
    });
  }

  // 고객과 기사로 좋아요 조회
  static async findByCustomerAndMover(customerId: number, moverId: number) {
    return await prisma.likes.findUnique({
      where: {
        customerId_moverId: {
          customerId,
          moverId,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mover: {
          select: {
            id: true,
            name: true,
            nickname: true,
            img: true,
            averageRating: true,
            totalReviews: true,
          },
        },
      },
    });
  }

  // 고객의 모든 좋아요 조회
  static async findByCustomerId(customerId: number) {
    return await prisma.likes.findMany({
      where: {
        customerId,
      },
      include: {
        mover: {
          select: {
            id: true,
            name: true,
            img: true,
            nickname: true,
            career: true,
            introduction: true,
            description: true,
            averageRating: true,
            totalReviews: true,
            isActive: true,
            deleted: true,
            moverRegions: {
              select: {
                region: true,
              },
            },
            moverServiceTypes: {
              select: {
                serviceType: true,
              },
            },
            _count: {
              select: {
                reviews: true,
                quotes: {
                  where: {
                    status: "ACCEPTED",
                  },
                },
                likes: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // 고객의 최근 좋아요 3개까지 조회
  static async findRecent3ByCustomerId(customerId: number) {
    const result = await prisma.likes.findMany({
      where: {
        customerId,
      },
      include: {
        mover: {
          select: {
            id: true,
            name: true,
            img: true,
            nickname: true,
            career: true,
            introduction: true,
            description: true,
            averageRating: true,
            totalReviews: true,
            isActive: true,
            deleted: true,
            moverRegions: {
              select: {
                region: true,
              },
            },
            moverServiceTypes: {
              select: {
                serviceType: true,
              },
            },
            _count: {
              select: {
                reviews: true,
                quotes: {
                  where: {
                    status: "ACCEPTED",
                  },
                },
                likes: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    return result.map((like) => {
      return like.mover;
    });
  }

  // 기사의 모든 좋아요 조회
  static async findByMoverId(moverId: number) {
    return await prisma.likes.findMany({
      where: {
        moverId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // 고객과 기사로 좋아요 삭제
  static async deleteByCustomerAndMover(customerId: number, moverId: number) {
    try {
      await prisma.likes.delete({
        where: {
          customerId_moverId: {
            customerId,
            moverId,
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // 좋아요 ID로 삭제
  static async deleteById(id: number) {
    try {
      await prisma.likes.delete({
        where: {
          id,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // 좋아요 일괄 삭제
  static async deleteAll(likeIds: number[], customerId: number) {
    return await prisma.likes.deleteMany({
      where: {
        id: { in: likeIds },
        customerId,
      },
    });
  }

  // 고객의 좋아요 개수 조회
  static async countByCustomerId(customerId: number) {
    return await prisma.likes.count({
      where: {
        customerId,
      },
    });
  }

  // 기사의 좋아요 개수 조회
  static async countByMoverId(moverId: number) {
    return await prisma.likes.count({
      where: {
        moverId,
      },
    });
  }
}
