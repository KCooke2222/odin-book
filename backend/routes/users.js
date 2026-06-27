import { prisma } from "../lib/prisma.js";
import { Router } from "express";
import { verifyToken } from "./auth.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  const users = await prisma.user.findMany({
    where: { id: { not: req.user.id } },
    select: {
      id: true,
      username: true,
      pfpUrl: true,
      bio: true,
      followers: {
        where: { followerId: req.user.id },
        select: { status: true },
      },
    },
  });

  res.json(users.map(({ followers, ...u }) => ({
    ...u,
    followStatus: followers[0]?.status ?? null,
  })));
});

// Incoming follow requests (people who requested to follow me)
router.get("/follow-requests", verifyToken, async (req, res) => {
  const requests = await prisma.follow.findMany({
    where: { followingId: req.user.id, status: "PENDING" },
    select: {
      createdAt: true,
      follower: { select: { id: true, username: true, pfpUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(requests.map((r) => ({ ...r.follower, requestedAt: r.createdAt })));
});

router.get("/:id", verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(req.params.id) },
    select: {
      id: true,
      username: true,
      pfpUrl: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          followers: { where: { status: "ACCEPTED" } },
          following: { where: { status: "ACCEPTED" } },
        },
      },
      followers: {
        where: { followerId: req.user.id },
        select: { status: true },
      },
    },
  });

  if (!user) return res.sendStatus(404);

  const { followers, _count, ...fields } = user;
  res.json({
    ...fields,
    followerCount: _count.followers,
    followingCount: _count.following,
    followStatus: followers[0]?.status ?? null,
  });
});

router.get("/:id/posts", verifyToken, async (req, res) => {
  const authorSelect = { select: { id: true, username: true, pfpUrl: true } };
  const posts = await prisma.post.findMany({
    where: { authorId: parseInt(req.params.id) },
    include: {
      author: authorSelect,
      comments: { include: { author: authorSelect, likes: true }, orderBy: { createdAt: "asc" } },
      likes: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(posts);
});

router.put("/:id", verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.sendStatus(403);

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { bio: req.body.bio, pfpUrl: req.body.pfpUrl },
    select: { id: true, username: true, pfpUrl: true, bio: true },
  });
  res.json(updated);
});

// Send a follow request to :id
router.post("/:id/follow", verifyToken, async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.user.id) return res.status(400).json({ message: "Cannot follow yourself" });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: req.user.id, followingId: targetId } },
  });
  if (existing) return res.status(409).json({ message: "Follow request already sent" });

  const follow = await prisma.follow.create({
    data: { followerId: req.user.id, followingId: targetId },
  });
  res.json(follow);
});

// Accept or reject a follow request — :id is the requester
router.put("/:id/follow", verifyToken, async (req, res) => {
  const requesterId = parseInt(req.params.id);
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: requesterId, followingId: req.user.id } },
  });
  if (!follow) return res.sendStatus(404);

  if (req.body.action === "accept") {
    const updated = await prisma.follow.update({
      where: { followerId_followingId: { followerId: requesterId, followingId: req.user.id } },
      data: { status: "ACCEPTED" },
    });
    return res.json(updated);
  }

  if (req.body.action === "reject") {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: requesterId, followingId: req.user.id } },
    });
    return res.sendStatus(204);
  }

  res.status(400).json({ message: "action must be accept or reject" });
});

// Unfollow or cancel your own pending request
router.delete("/:id/follow", verifyToken, async (req, res) => {
  const targetId = parseInt(req.params.id);
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: req.user.id, followingId: targetId } },
  });
  if (!follow) return res.sendStatus(404);

  await prisma.follow.delete({
    where: { followerId_followingId: { followerId: req.user.id, followingId: targetId } },
  });
  res.sendStatus(204);
});

export default router;
