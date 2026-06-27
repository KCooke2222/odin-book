import { prisma } from "../lib/prisma.js";
import { Router } from "express";
import { verifyToken } from "./auth.js";

const router = Router();

const authorSelect = { select: { id: true, username: true, pfpUrl: true } };

const postInclude = {
  author: authorSelect,
  comments: { include: { author: authorSelect, likes: true }, orderBy: { createdAt: "asc" } },
  likes: true,
};

router.get("/feed", verifyToken, async (req, res) => {
  const follows = await prisma.follow.findMany({
    where: { followerId: req.user.id, status: "ACCEPTED" },
    select: { followingId: true },
  });
  // include your own posts in the feed alongside people you follow
  const feedIds = [req.user.id, ...follows.map((f) => f.followingId)];

  const posts = await prisma.post.findMany({
    where: { authorId: { in: feedIds } },
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json(posts);
});


router.post("/", verifyToken, async (req, res) => {
  const post = await prisma.post.create({
    data: {
      content: req.body.content,
      imageUrls: req.body.imageUrls ?? [],
      authorId: req.user.id,
    },
  });
  res.json(post);
});

router.get("/:id", verifyToken, async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      author: { select: { id: true, username: true, pfpUrl: true } },
      comments: { include: { author: { select: { id: true, username: true, pfpUrl: true } }, likes: true } },
      likes: true,
    },
  });
  if (!post) return res.sendStatus(404);
  res.json(post);
});

router.put("/:id", verifyToken, async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!post) return res.sendStatus(404);
  if (post.authorId !== req.user.id) return res.sendStatus(403);

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { content: req.body.content, imageUrls: req.body.imageUrls ?? post.imageUrls },
  });
  res.json(updated);
});

router.post("/:id/likes", verifyToken, async (req, res) => {
  const like = await prisma.like.create({
    data: { userId: req.user.id, postId: parseInt(req.params.id) },
  });
  res.json(like);
});

router.delete("/:id/likes", verifyToken, async (req, res) => {
  await prisma.like.delete({
    where: { userId_postId: { userId: req.user.id, postId: parseInt(req.params.id) } },
  });
  res.sendStatus(204);
});

router.delete("/:id", verifyToken, async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!post) return res.sendStatus(404);
  if (post.authorId !== req.user.id) return res.sendStatus(403);

  await prisma.post.delete({ where: { id: post.id } });
  res.sendStatus(204);
});

export default router;
