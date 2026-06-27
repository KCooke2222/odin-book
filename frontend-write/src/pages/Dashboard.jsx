import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPosts, updatePost, deletePost, deleteComment } from "../api";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  async function togglePublish(post) {
    await updatePost(post.id, { title: post.title, content: post.content, published: !post.published });
    getPosts().then(setPosts);
  }

  async function handleDeletePost(id) {
    if (!confirm("Delete this post?")) return;
    await deletePost(id);
    getPosts().then(setPosts);
  }

  async function handleDeleteComment(postId, commentId) {
    await deleteComment(postId, commentId);
    getPosts().then(setPosts);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="page">
      <div className="nav">
        <h1>Dashboard</h1>
        <div className="nav-actions">
          <Link to="/posts/new"><button>+ New Post</button></Link>
          <button className="secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-card-header">
              <div>
                <h2>{post.title}</h2>
                <span className={`badge ${post.published ? "published" : "draft"}`}>
                  {post.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="post-actions">
                <button className="secondary" onClick={() => togglePublish(post)}>
                  {post.published ? "Unpublish" : "Publish"}
                </button>
                <Link to={`/posts/${post.id}/edit`}><button className="secondary">Edit</button></Link>
                <button className="danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
              </div>
            </div>

            {post.comments?.length > 0 && (
              <div className="comments-section">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <span><strong>{comment.authorName}</strong>: {comment.content}</span>
                    <button className="danger" onClick={() => handleDeleteComment(post.id, comment.id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
