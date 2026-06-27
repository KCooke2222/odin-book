const API = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

export async function signup(username, password) {
  await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  localStorage.setItem("token", data.token);
}

export async function getPosts() {
  const res = await fetch(`${API}/posts/all`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

export async function getPost(id) {
  const res = await fetch(`${API}/posts/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

export async function createPost(data) {
  const res = await fetch(`${API}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePost(id, data) {
  const res = await fetch(`${API}/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePost(id) {
  await fetch(`${API}/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export async function deleteComment(postId, commentId) {
  await fetch(`${API}/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}
