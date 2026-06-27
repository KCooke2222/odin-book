import { prisma } from "../lib/prisma.js";
import { Router } from "express";
import { verifyToken } from "./auth.js";

const router = Router({ mergeParams: true });

const commentInclude = {
  author: { select: { id: true, username: true, pfpUrl: true } },
  likes: true,
};

router.get("/", verifyToken, async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { postId: parseInt(req.params.postId) },
    include: commentInclude,
    orderBy: { createdAt: "asc" },
  });
  res.json(comments);
});

router.post("/", verifyToken, async (req, res) => {
  const comment = await prisma.comment.create({
    data: {
      content: req.body.content,
      authorId: req.user.id,
      postId: parseInt(req.params.postId),
    },
    include: commentInclude,
  });
  res.json(comment);
});

router.put("/:commentId", verifyToken, async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: parseInt(req.params.commentId) } });
  if (!comment) return res.sendStatus(404);
  if (comment.authorId !== req.user.id) return res.sendStatus(403);

  const updated = await prisma.comment.update({
    where: { id: comment.id },
    data: { content: req.body.content },
    include: commentInclude,
  });
  res.json(updated);
});

router.post("/:commentId/likes", verifyToken, async (req, res) => {
  const like = await prisma.like.create({
    data: { userId: req.user.id, commentId: parseInt(req.params.commentId) },
  });
  res.json(like);
});

router.delete("/:commentId/likes", verifyToken, async (req, res) => {
  await prisma.like.delete({
    where: { userId_commentId: { userId: req.user.id, commentId: parseInt(req.params.commentId) } },
  });
  res.sendStatus(204);
});

router.delete("/:commentId", verifyToken, async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: parseInt(req.params.commentId) } });
  if (!comment) return res.sendStatus(404);
  if (comment.authorId !== req.user.id) return res.sendStatus(403);

  await prisma.comment.delete({ where: { id: comment.id } });
  res.sendStatus(204);
});

export default router;
