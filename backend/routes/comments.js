import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router({ mergeParams: true });

router.post("/", async (req, res) => {
  const comment = await prisma.comment.create({
    data: {
      content: req.body.content,
      authorName: req.body.authorName,
      postId: parseInt(req.params.postId),
    },
  });

  res.json(comment);
});

export default router;
