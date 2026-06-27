import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeed, getUsers, sendFollowRequest, unfollow } from "../api";
import PostCard from "../components/PostCard";

function UsersSidebar() {
  const [users, setUsers] = useState([]);

  function load() { getUsers().then(setUsers); }
  useEffect(() => { load(); }, []);

  async function handleFollow(user) {
    if (user.followStatus === "ACCEPTED") await unfollow(user.id);
    else if (!user.followStatus) await sendFollowRequest(user.id);
    load();
  }

  return (
    <aside className="sidebar card">
      <h3>People</h3>
      <ul className="user-list">
        {users.map((u) => (
          <li key={u.id} className="user-row">
            <Link to={`/users/${u.id}`} className="user-link">
              {u.pfpUrl
                ? <img src={u.pfpUrl} alt="" className="avatar-sm" />
                : <span className="avatar-sm avatar-placeholder">{u.username[0].toUpperCase()}</span>}
              <span>{u.username}</span>
            </Link>
            <button className="small" onClick={() => handleFollow(u)} disabled={u.followStatus === "PENDING"}>
              {u.followStatus === "ACCEPTED" ? "Following" : u.followStatus === "PENDING" ? "Requested" : "Follow"}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);

  function loadFeed() { getFeed().then(setPosts); }

  useEffect(() => {
    loadFeed();
    window.addEventListener("posts:changed", loadFeed);
    return () => window.removeEventListener("posts:changed", loadFeed);
  }, []);

  return (
    <div className="home-layout">
      <section className="feed">
        {posts.length === 0 && <p className="muted empty">Your feed is empty. Use + to post or follow people.</p>}
        {posts.map((p) => <PostCard key={p.id} post={p} onChange={loadFeed} />)}
      </section>
      <UsersSidebar />
    </div>
  );
}
