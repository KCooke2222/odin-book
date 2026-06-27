import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../api";

function getPreview(content) {
  try {
    const blocks = JSON.parse(content);
    const text = blocks
      .flatMap((b) => b.content ?? [])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join(" ");
    return text.slice(0, 160) + (text.length > 160 ? "…" : "");
  } catch {
    return content.replace(/<[^>]+>/g, "").slice(0, 160);
  }
}

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  return (
    <div className="post-list">
      {posts.map((post) => (
        <div key={post.id} className="post-preview">
          <h2><Link to={`/posts/${post.id}`}>{post.title}</Link></h2>
          <p>{getPreview(post.content)}</p>
        </div>
      ))}
    </div>
  );
}
