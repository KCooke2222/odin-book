import { prisma } from "../lib/prisma.js";
import { Router } from "express";
import { verifyToken } from "./auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const posts = await prisma.post.findMany({ where: { published: true } });
  res.json(posts);
});

router.get("/all", verifyToken, async (req, res) => {
  const posts = await prisma.post.findMany();
  res.json(posts);
});

router.post("/", verifyToken, async (req, res) => {
  const post = await prisma.post.create({
    data: {
      title: req.body.title,
      content: req.body.content,
      authorId: req.user.id,
    },
  });

  res.json(post);
});

router.get("/:id", async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { comments: true },
  });

  res.json(post);
});

router.put("/:id", verifyToken, async (req, res) => {
  const post = await prisma.post.update({
    where: { id: parseInt(req.params.id) },
    data: { title: req.body.title, content: req.body.content, published: req.body.published },
  });

  res.json(post);
});

router.delete("/:id", verifyToken, async (req, res) => {
  await prisma.post.delete({ where: { id: parseInt(req.params.id) } });
  res.sendStatus(204);
});

export default router;
