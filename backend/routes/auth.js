import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { body, validationResult, matchedData } from "express-validator";
import { prisma } from "../lib/prisma.js";

const router = Router();

export function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const validateSignup = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters")
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

router.post("/signup", validateSignup, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = matchedData(req);
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { username, password: hashedPassword } });

  res.sendStatus(201);
});

router.post("/login", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.body.username },
  });

  if (!user) return res.status(401).json({ message: "Incorrect username" });

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  res.json({ token });
});

export default router;
