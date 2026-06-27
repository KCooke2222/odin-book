import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUser, getUserPosts, sendFollowRequest, unfollow,
  updateProfile, getFollowRequests, respondToFollow, getMyId,
} from "../api";
import PostCard from "../components/PostCard";

function EditProfile({ user, onSaved }) {
  const [bio, setBio] = useState(user.bio ?? "");
  const [pfpUrl, setPfpUrl] = useState(user.pfpUrl ?? "");

  async function handleSubmit(e) {
    e.preventDefault();
    await updateProfile(user.id, { bio, pfpUrl: pfpUrl || null });
    onSaved();
  }

  return (
    <form className="edit-profile card" onSubmit={handleSubmit}>
      <h3>Edit profile</h3>
      <label>Bio
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} />
      </label>
      <label>Profile picture URL
        <input value={pfpUrl} onChange={(e) => setPfpUrl(e.target.value)} placeholder="https://..." />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}

function FollowRequests({ onResponded }) {
  const [requests, setRequests] = useState([]);

  function load() { getFollowRequests().then(setRequests); }
  useEffect(() => { load(); }, []);

  async function respond(userId, action) {
    await respondToFollow(userId, action);
    load();
    onResponded();
  }

  if (requests.length === 0) return null;

  return (
    <div className="card requests">
      <h3>Follow requests</h3>
      <ul className="user-list">
        {requests.map((u) => (
          <li key={u.id} className="user-row">
            <span className="user-link">
              {u.pfpUrl
                ? <img src={u.pfpUrl} alt="" className="avatar-sm" />
                : <span className="avatar-sm avatar-placeholder">{u.username[0].toUpperCase()}</span>}
              <span>{u.username}</span>
            </span>
            <span className="request-actions">
              <button className="small" onClick={() => respond(u.id, "accept")}>Accept</button>
              <button className="small ghost" onClick={() => respond(u.id, "reject")}>Reject</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const myId = getMyId();
  const isMe = parseInt(id) === myId;

  function loadUser() { getUser(id).then(setUser); }
  function loadPosts() { getUserPosts(id).then(setPosts); }
  useEffect(() => {
    loadUser(); loadPosts(); setEditing(false);
    window.addEventListener("posts:changed", loadPosts);
    return () => window.removeEventListener("posts:changed", loadPosts);
  }, [id]);

  if (!user) return <p className="muted">Loading...</p>;

  async function handleFollow() {
    if (user.followStatus === "ACCEPTED") await unfollow(user.id);
    else if (!user.followStatus) await sendFollowRequest(user.id);
    loadUser();
  }

  return (
    <div className="profile-page">
      <div className="profile-header card">
        {user.pfpUrl
          ? <img src={user.pfpUrl} alt="" className="avatar-lg" />
          : <div className="avatar-lg avatar-placeholder">{user.username[0].toUpperCase()}</div>}
        <div className="profile-info">
          <h2>{user.username}</h2>
          {user.bio && <p>{user.bio}</p>}
          <div className="profile-counts">
            <span><strong>{user.followerCount}</strong> followers</span>
            <span><strong>{user.followingCount}</strong> following</span>
          </div>
          {isMe
            ? <button className="ghost" onClick={() => setEditing((v) => !v)}>{editing ? "Cancel" : "Edit profile"}</button>
            : <button onClick={handleFollow} disabled={user.followStatus === "PENDING"}>
                {user.followStatus === "ACCEPTED" ? "Following" : user.followStatus === "PENDING" ? "Requested" : "Follow"}
              </button>}
        </div>
      </div>

      {isMe && editing && <EditProfile user={user} onSaved={() => { setEditing(false); loadUser(); }} />}
      {isMe && <FollowRequests onResponded={loadUser} />}

      <div className="profile-posts">
        <h3>Posts</h3>
        {posts.length === 0 && <p className="muted empty">No posts yet.</p>}
        {posts.map((post) => <PostCard key={post.id} post={post} onChange={loadPosts} />)}
      </div>
    </div>
  );
}
