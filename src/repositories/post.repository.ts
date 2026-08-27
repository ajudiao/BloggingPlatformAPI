import prisma from "../lib/prisma";
import { CreatePostDTO, FindAllPostsDTO } from "../types/post.types";
import { NotFoundError } from "../utils/errors";

export async function createPost(data: CreatePostDTO) {
  return prisma.post.create({ data });
}

export async function findAllPosts({ sortBy, order }: FindAllPostsDTO) {
  return prisma.post.findMany({
    orderBy: { [sortBy]: order },
  });
}

export async function deletePost(id: number) {
  try {
    return await prisma.post.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      throw NotFoundError("Post não encontrado");
    }

      throw error;
  }
}

export async function getPostById(id: number) {
    return prisma.post.findUnique({
        where: {
            id,
        },
    });
}
