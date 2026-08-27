import { Request, Response } from "express";
import {
  createPostSchema,
  findAllPostsQuerySchema,
} from "../validators/post.validator";
import {
  createPost as createPostService,
  findAllPosts as findAllPostsService,
  deletePost as deletePostService,
  getPostById as getPostPostByIdService,
} from "../services/post.service";
import { z } from "zod";
import { BadRequestError } from "../utils/errors";

export async function createPost(req: Request, res: Response) {
  const result = createPostSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid post data",
      errors: z.flattenError(result.error).fieldErrors,
    });
  }

  const post = await createPostService(result.data);

  return res.status(201).json(post);
}

export async function findAllPosts(req: Request, res: Response) {
  const result = findAllPostsQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid sorting parameters",
      errors: z.flattenError(result.error).fieldErrors,
    });
  }

  const posts = await findAllPostsService(result.data);

  return res.status(200).json(posts);
}

export async function updatePost(req: Request, res: Response) {
  // implementar
}

export async function deletePost(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) throw BadRequestError("Id inválido");

  const post = await deletePostService(id);

  return res.status(200).json({
    message: "Post deleted successfully",
    post,
  });
}

export async function findPostById(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) throw BadRequestError("Id inválido");

  const post = await getPostPostByIdService(id);

  return res.status(200).json({
    message: "Post found successfully",
    post,
  });
}
