import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";
import commentsRouter from "./routes/comments.js";
import usersRouter from "./routes/users.js";

const app = express();

const origins = process.env.ALLOWED_ORIGINS?.split(",") ?? [];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options("/*path", cors(corsOptions));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/posts/:postId/comments", commentsRouter);
app.use("/users", usersRouter);

app.listen(3000, () => console.log("app listening on port 3000!"));
