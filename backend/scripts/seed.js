import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import UserModel from "../models/User.model.js";
import PostModel from "../models/Post.model.js";
import PostLikeModel from "../models/PostLike.model.js";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const users = [
  {
    name: "Getuar",
    surname: "Jakupi",
    username: "getuar",
    email: "getuar@test.com",
  }, // 3 posts
  { name: "Era", surname: "Mustafa", username: "era", email: "era@test.com" }, // 2 posts
  { name: "Eris", surname: "Dinaj", username: "eris", email: "eris@test.com" }, // 2 posts
  {
    name: "Blerina",
    surname: "Sadiku",
    username: "blerina",
    email: "blerina@test.com",
  }, // 2 posts
  {
    name: "Ardit",
    surname: "Hoxha",
    username: "ardit",
    email: "ardit@test.com",
  }, // 2 posts
  {
    name: "Lina",
    surname: "Krasniqi",
    username: "lina",
    email: "lina@test.com",
  }, // 2 posts
  {
    name: "Dion",
    surname: "Berisha",
    username: "dion",
    email: "dion@test.com",
  }, // 2 posts
  { name: "Sara", surname: "Aliu", username: "sara", email: "sara@test.com" }, // 2 posts
  { name: "Noel", surname: "Rama", username: "noel", email: "noel@test.com" }, // 2 posts
  { name: "Vesa", surname: "Zeka", username: "vesa", email: "vesa@test.com" }, // 1 post
];

// 20 posts: mix of image posts + text-only posts
const posts = [
  {
    content:
      "It rained all day. The city looked like a mirror — reflections everywhere.",
    imageUrl: "/uploads/rain.webp",
  },
  {
    content: "A good coffee fixes the mood. Simple, but effective.",
    imageUrl: "/uploads/coffee.webp",
  },
  {
    content: "The library is where noise doesn’t dare to enter.",
    imageUrl: "/uploads/library.jpg",
  },
  {
    content: "Today’s sunset was unreal. Colors you don’t see often.",
    imageUrl: "/uploads/sunsetCity.jpg",
  },
  {
    content: "Light hike, calm mind. That’s all you need sometimes.",
    imageUrl: "/uploads/hiking.jpg",
  },
  {
    content: "Finally finished a feature that drained me for 2 days. ",
    imageUrl: "/uploads/laptop.jpg",
  },
  {
    content: "Clean desk, clean mind. It’s real.",
    imageUrl: "/uploads/desk.jpg",
  },
  {
    content: "Short workout, solid intensity. Consistency > motivation.",
    imageUrl: "/uploads/gym.jpg",
  },
  {
    content: "Pizza is a universal language. No debate.",
    imageUrl: "/uploads/pizza.webp",
  },
  {
    content: "Pasta + a good movie = a peaceful night.",
    imageUrl: "/uploads/pasta.jpg",
  },
  {
    content: "The neighborhood cat sat by the window like it owns the city.",
    imageUrl: "/uploads/cat.webp",
  },
  { content: "Starry night. No words needed.", imageUrl: "/uploads/night.jpg" },
  {
    content:
      "In the forest, every step changes your breathing rhythm. You feel it.",
    imageUrl: "/uploads/forest.jpg",
  },
  {
    content: "Ocean waves are a mental reset. Always.",
    imageUrl: "/uploads/beach.jpg",
  },
  {
    content: "Night city vibe: neon, movement, energy.",
    imageUrl: "/uploads/neon.webp",
  },
  {
    content: "Headphones on. World off. Small kind of magic.",
    imageUrl: "/uploads/headphones.webp",
  },
  {
    content: "Wrote some notes today and got my focus back.",
    imageUrl: "/uploads/notebook.jpg",
  },
  {
    content: "Train rides: scenery + thoughts. Quiet in a good way.",
    imageUrl: "/uploads/train.jpg",
  },
  {
    content: "Snow this morning. The city turned into a postcard.",
    imageUrl: "/uploads/snow.jpg",
  },
  {
    content: "A small bouquet on the table makes the day lighter.",
    imageUrl: "/uploads/flower.jpg",
  },
];

// Distribution: 1 user has 3 posts, 1 user has 1 post, others have 2 posts => 20 total
const distribution = [3, 2, 2, 2, 2, 2, 2, 2, 2, 1];

function pickRandomSubset(arr, probability = 0.5) {
  return arr.filter(() => Math.random() < probability);
}

async function seed() {
  if (!MONGO_URI) throw new Error("MONGO_URI missing in .env");

  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clear existing data (comment these out if you don’t want to wipe the DB)
  await Promise.all([
    PostLikeModel.deleteMany({}),
    PostModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);

  // Keep your password EXACTLY as you use it
  const hashed = await bcrypt.hash("12345678", 10);

  // Create users
  const createdUsers = await UserModel.insertMany(
    users.map((u, i) => ({
      ...u,
      birthday: new Date(2000, i % 12, (i % 28) + 1), // data valide
      passwordHash: hashed, // ✅ schema jote e do passwordHash
    })),
  );

  // Create posts based on distribution
  const createdPosts = [];
  let postIndex = 0;

  for (let u = 0; u < createdUsers.length; u++) {
    const count = distribution[u];

    for (let i = 0; i < count; i++) {
      const base = posts[postIndex];

      // Make 3 posts text-only (no imageUrl)
      const makeTextOnly = [2, 9, 16].includes(postIndex);
      const imageUrl = makeTextOnly ? "" : base.imageUrl || "";

      const p = await PostModel.create({
        user: createdUsers[u]._id, // ✅ te schema jote quhet "user"
        content: base.content,
        imageUrl,
        likesCount: 0,
        isActive: true,
      });

      createdPosts.push(p);
      postIndex++;
    }
  }

  // Create random likes
  for (const post of createdPosts) {
    const likers = pickRandomSubset(createdUsers, 0.5);

    for (const liker of likers) {
      // Optional: prevent liking your own posts
      if (String(liker._id) === String(post.user)) continue;

      await PostLikeModel.create({ postId: post._id, userId: liker._id });
      await PostModel.updateOne({ _id: post._id }, { $inc: { likesCount: 1 } });
    }
  }

  console.log("✅ Seed finished successfully");
  console.log("👉 Login for all seeded users: password = 12345678");
  console.log("Example:", users[0].email, "/ 12345678");

  await mongoose.disconnect();
  console.log("✅ Disconnected");
}

seed().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
