import { Router } from "express";
import {
	createPost,
	deletePost,
	findAllPosts,
	findPostById,
	updatePost,
} from "../controllers/post.controller";

const router = Router();

router.post("/", createPost);
router.get("/", findAllPosts);
router.get("/:id", findPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;