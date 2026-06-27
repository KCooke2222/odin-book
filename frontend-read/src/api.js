const API = import.meta.env.VITE_API_URL;

export async function getPosts() {
  const res = await fetch(`${API}/posts`);
  return res.json();
}

export async function getPost(id) {
  const res = await fetch(`${API}/posts/${id}`);
  return res.json();
}

export async function postComment(postId, commentData) {
  const res = await fetch(`${API}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  });

  return res.json();
}
