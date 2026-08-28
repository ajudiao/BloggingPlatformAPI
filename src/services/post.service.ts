import {
  createPost as createPostRepository,
  deletePost as deletePostRepository,
  findAllPosts as findAllPostsRepository,
  getPostById as getPostByIdRepository
  ,updatePost as updatePostRepository
} from "../repositories/post.repository";
import { BadRequestError, NotFoundError } from "../utils/errors";
import {
  CreatePostDTO,
  FindAllPostsDTO,
  UpdatePostDTO,
} from "../types/post.types";

export async function createPost(data: CreatePostDTO) {
  const title = data.title.trim();

  if (title.length < 5) {
    throw BadRequestError("O título deve ter pelo menos 5 caracteres");
  }

  try {
    return await createPostRepository({
      ...data,
      title,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw BadRequestError("Já existe um post com este título");
    }

    throw error;
  }
}

export async function findAllPosts(options: FindAllPostsDTO) {
  return findAllPostsRepository(options);
}

export async function updatePost(id: number, data: UpdatePostDTO) {
  const title = data.title.trim();

  if (title.length < 5) {
    throw BadRequestError("O título deve ter pelo menos 5 caracteres");
  }

  try {
    return await updatePostRepository(id, {
      ...data,
      title,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw BadRequestError("Já existe um post com este título");
    }

    throw error;
  }
}

export async function deletePost(id: number) {
    return await deletePostRepository(id);
}

export async function getPostById(id: number) {
    const post = await getPostByIdRepository(id);

    if (!post) {
        throw NotFoundError("Post não encontrado");
    }

    return post;
}
