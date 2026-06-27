const API = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (auth) headers["Authorization"] = `Bearer ${getToken()}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  // 204 deletes and plaintext responses (e.g. signup's 201) have no JSON body
  const contentType = res.headers.get("content-type");
  return contentType?.includes("application/json") ? res.json() : null;
}

// Auth
export const signup = (username, password) =>
  request("/auth/signup", { method: "POST", body: { username, password }, auth: false });

export const login = async (username, password) => {
  const data = await request("/auth/login", { method: "POST", body: { username, password }, auth: false });
  localStorage.setItem("token", data.token);
  return data;
};

export const logout = () => localStorage.removeItem("token");

// Posts
export const getFeed = () => request("/posts/feed");
export const getPost = (id) => request(`/posts/${id}`);
export const createPost = (data) => request("/posts", { method: "POST", body: data });
export const updatePost = (id, data) => request(`/posts/${id}`, { method: "PUT", body: data });
export const deletePost = (id) => request(`/posts/${id}`, { method: "DELETE" });
export const likePost = (id) => request(`/posts/${id}/likes`, { method: "POST" });
export const unlikePost = (id) => request(`/posts/${id}/likes`, { method: "DELETE" });

// Comments
export const getComments = (postId) => request(`/posts/${postId}/comments`);
export const createComment = (postId, content) =>
  request(`/posts/${postId}/comments`, { method: "POST", body: { content } });
export const updateComment = (postId, commentId, content) =>
  request(`/posts/${postId}/comments/${commentId}`, { method: "PUT", body: { content } });
export const deleteComment = (postId, commentId) =>
  request(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
export const likeComment = (postId, commentId) =>
  request(`/posts/${postId}/comments/${commentId}/likes`, { method: "POST" });
export const unlikeComment = (postId, commentId) =>
  request(`/posts/${postId}/comments/${commentId}/likes`, { method: "DELETE" });

// Users
export const getUsers = () => request("/users");
export const getUser = (id) => request(`/users/${id}`);
export const getUserPosts = (id) => request(`/users/${id}/posts`);
export const updateProfile = (id, data) => request(`/users/${id}`, { method: "PUT", body: data });
export const sendFollowRequest = (id) => request(`/users/${id}/follow`, { method: "POST" });
export const respondToFollow = (requesterId, action) =>
  request(`/users/${requesterId}/follow`, { method: "PUT", body: { action } });
export const unfollow = (id) => request(`/users/${id}/follow`, { method: "DELETE" });
export const getFollowRequests = () => request("/users/follow-requests");

// Current user id, decoded from the JWT
export const getMyId = () => JSON.parse(atob(getToken().split(".")[1])).id;
