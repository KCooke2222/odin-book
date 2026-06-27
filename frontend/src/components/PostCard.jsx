import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiEdit2, FiTrash2 } from "react-icons/fi";
import { likePost, unlikePost, updatePost, deletePost, getMyId } from "../api";
import Comments from "./Comments";

export default function PostCard({ post, onChange }) {
  const myId = getMyId();
  const liked = post.likes.some((l) => l.userId === myId);
  const isMine = post.author.id === myId;

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  async function toggleLike() {
    liked ? await unlikePost(post.id) : await likePost(post.id);
    onChange();
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editContent.trim()) return;
    await updatePost(post.id, { content: editContent });
    setEditing(false);
    onChange();
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await deletePost(post.id);
    onChange();
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/users/${post.author.id}`} className="user-link">
          {post.author.pfpUrl
            ? <img src={post.author.pfpUrl} alt="" className="avatar-sm" />
            : <span className="avatar-sm avatar-placeholder">{post.author.username[0].toUpperCase()}</span>}
          <strong>{post.author.username}</strong>
        </Link>
        <span className="muted">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      {editing ? (
        <form className="create-post" onSubmit={saveEdit}>
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} autoFocus />
          <div className="post-actions">
            <button type="submit" className="small">Save</button>
            <button type="button" className="ghost small" onClick={() => { setEditContent(post.content); setEditing(false); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <p className="post-content">{post.content}</p>
      )}

      {post.imageUrls.length > 0 && (
        <div className="post-images">
          {post.imageUrls.map((url) => <img key={url} src={url} alt="" />)}
        </div>
      )}

      <div className="post-actions">
        <button className={`action ${liked ? "liked" : ""}`} onClick={toggleLike}>
          <FiHeart /> {post.likes.length}
        </button>
        <button className="action" onClick={() => setExpanded((v) => !v)}>
          <FiMessageCircle /> {post.comments.length}
        </button>
        {isMine && !editing && <button className="action" onClick={() => setEditing(true)}><FiEdit2 /></button>}
        {isMine && <button className="action" onClick={handleDelete}><FiTrash2 /></button>}
      </div>

      <div
        className={expanded ? "" : "comments-collapsed"}
        onClick={!expanded ? () => setExpanded(true) : undefined}
      >
        <Comments postId={post.id} comments={post.comments} expanded={expanded} onChange={onChange} />
        {!expanded && post.comments.length > 0 && (
          <span className="view-comments">View all {post.comments.length} comments</span>
        )}
      </div>
    </div>
  );
}
