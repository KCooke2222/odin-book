import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiEdit2, FiTrash2 } from "react-icons/fi";
import { createComment, updateComment, deleteComment, likeComment, unlikeComment, getMyId } from "../api";

function CommentRow({ postId, comment, myId, onChange }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const liked = comment.likes.some((l) => l.userId === myId);
  const isMine = comment.authorId === myId;

  async function saveEdit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await updateComment(postId, comment.id, text);
    setEditing(false);
    onChange();
  }

  async function toggleLike() {
    liked ? await unlikeComment(postId, comment.id) : await likeComment(postId, comment.id);
    onChange();
  }

  return (
    <div className="comment">
      <div className="comment-header">
        <Link to={`/users/${comment.author.id}`} className="user-link">
          {comment.author.pfpUrl
            ? <img src={comment.author.pfpUrl} alt="" className="avatar-sm" />
            : <span className="avatar-sm avatar-placeholder">{comment.author.username[0].toUpperCase()}</span>}
          <strong>{comment.author.username}</strong>
        </Link>
        <span className="muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>

      {editing ? (
        <form className="comment-form" onSubmit={saveEdit}>
          <input value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          <button type="submit" className="small">Save</button>
          <button type="button" className="ghost small" onClick={() => { setText(comment.content); setEditing(false); }}>Cancel</button>
        </form>
      ) : (
        <p>{comment.content}</p>
      )}

      <div className="comment-actions">
        <button className={`action ${liked ? "liked" : ""}`} onClick={toggleLike}>
          <FiHeart /> {comment.likes.length}
        </button>
        {isMine && !editing && <button className="action" onClick={() => setEditing(true)}><FiEdit2 /></button>}
        {isMine && <button className="action" onClick={() => deleteComment(postId, comment.id).then(onChange)}><FiTrash2 /></button>}
      </div>
    </div>
  );
}

export default function Comments({ postId, comments, expanded, onChange }) {
  const [text, setText] = useState("");
  const myId = getMyId();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await createComment(postId, text);
    setText("");
    onChange();
  }

  // Collapsed: blur a teaser of existing comments
  if (!expanded) {
    if (comments.length === 0) return null;
    return (
      <div className="comments-teaser">
        {comments.slice(0, 2).map((c) => (
          <p key={c.id} className="teaser-line"><strong>{c.author.username}</strong> {c.content}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="comments">
      <form className="comment-form" onSubmit={handleSubmit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." />
        <button type="submit" className="small">Send</button>
      </form>
      {comments.map((c) => (
        <CommentRow key={c.id} postId={postId} comment={c} myId={myId} onChange={onChange} />
      ))}
    </div>
  );
}
