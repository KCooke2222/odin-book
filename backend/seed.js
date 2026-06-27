import "dotenv/config";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { prisma } from "./lib/prisma.js";

// --- Monkey cast -----------------------------------------------------------
const MONKEYS = [
  { username: "george", bio: "Curious about everything. 🍌" },
  { username: "kong", bio: "Big personality, bigger appetite." },
  { username: "abu", bio: "Street rat with a heart of gold." },
  { username: "caesar", bio: "Apes together strong." },
  { username: "rafiki", bio: "It is time. 🥥" },
  { username: "bubbles", bio: "Just hanging around." },
  { username: "donkeykong", bio: "Banana hoard manager." },
  { username: "marcel", bio: "I get lost a lot." },
];

const POST_TEXTS = [
  "Just found the ripest banana in the whole jungle 🍌🍌🍌",
  "Anyone else think the canopy looks amazing today?",
  "Swung 40 feet between trees. New personal record!",
  "Grooming session with the troop. Self-care matters.",
  "Why do humans keep pointing those little black boxes at me?",
  "Coconut count: 17. It's been a productive morning.",
  "Took a nap in the sun. 10/10 would recommend.",
  "The vines are extra bouncy after the rain 🌧️",
  "Spotted a leopard. Stayed very, very still.",
  "New troop member today. Welcome to the family!",
];

// Reliable image source for photos
const photo = (seed) => `https://picsum.photos/seed/${seed}/600/400`;

// Pull a handful of monkey GIFs from Tenor's public test key (falls back gracefully)
async function fetchMonkeyGifs(limit = 12) {
  try {
    const res = await fetch(`https://g.tenor.com/v1/search?q=monkey&key=LIVDSRZULELA&limit=${limit}&media_filter=minimal`);
    const data = await res.json();
    return data.results.map((r) => r.media[0].gif.url).filter(Boolean);
  } catch {
    console.warn("Tenor fetch failed — seeding photos only.");
    return [];
  }
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log("Clearing existing data...");
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const gifs = await fetchMonkeyGifs();
  const password = await bcrypt.hash("password123", 10);

  console.log("Creating users...");
  const users = [];
  for (let i = 0; i < MONKEYS.length; i++) {
    const m = MONKEYS[i];
    const user = await prisma.user.create({
      data: {
        username: m.username,
        password,
        bio: m.bio,
        pfpUrl: `https://i.pravatar.cc/150?img=${i + 10}`,
      },
    });
    users.push(user);
  }

  console.log("Creating posts...");
  const posts = [];
  for (const user of users) {
    const count = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < count; i++) {
      const imageUrls = [];
      const roll = Math.random();
      if (roll < 0.35) imageUrls.push(photo(faker.string.alphanumeric(8)));
      else if (roll < 0.55 && gifs.length) imageUrls.push(pick(gifs));

      const post = await prisma.post.create({
        data: {
          content: pick(POST_TEXTS),
          imageUrls,
          authorId: user.id,
          createdAt: faker.date.recent({ days: 14 }),
        },
      });
      posts.push(post);
    }
  }

  console.log("Creating follows (mostly accepted, a few pending)...");
  for (const follower of users) {
    for (const following of users) {
      if (follower.id === following.id) continue;
      if (Math.random() < 0.45) {
        await prisma.follow.create({
          data: {
            followerId: follower.id,
            followingId: following.id,
            status: Math.random() < 0.85 ? "ACCEPTED" : "PENDING",
          },
        });
      }
    }
  }

  console.log("Creating likes and comments...");
  for (const post of posts) {
    for (const user of users) {
      if (Math.random() < 0.4) {
        await prisma.like.create({ data: { userId: user.id, postId: post.id } }).catch(() => {});
      }
      if (Math.random() < 0.25) {
        await prisma.comment.create({
          data: {
            content: pick([
              "🍌🍌🍌", "So true!", "Haha love this", "Wish I was there",
              "Goals 🐵", "Send me the coordinates", "Iconic", "This made my day",
            ]),
            authorId: user.id,
            postId: post.id,
            createdAt: faker.date.recent({ days: 7 }),
          },
        });
      }
    }
  }

  // A few comment likes too
  const comments = await prisma.comment.findMany();
  for (const comment of comments) {
    for (const user of users) {
      if (Math.random() < 0.2) {
        await prisma.like.create({ data: { userId: user.id, commentId: comment.id } }).catch(() => {});
      }
    }
  }

  console.log(`\nDone! Seeded ${users.length} users, ${posts.length} posts.`);
  console.log("Log in with any username (george, kong, abu, ...) and password: password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
