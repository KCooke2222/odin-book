import { useState } from "react";
import { FiX } from "react-icons/fi";
import { createPost } from "../api";

export default function CreatePostModal({ onClose, onCreated }) {
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [urlInput, setUrlInput] = useState("");

  function addImage() {
    const url = urlInput.trim();
    if (!url || imageUrls.includes(url)) return;
    setImageUrls((prev) => [...prev, url]);
    setUrlInput("");
  }

  function removeImage(url) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    await createPost({ content, imageUrls });
    onCreated();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create post</h3>
          <button className="icon-btn" onClick={onClose}><FiX /></button>
        </div>

        <form className="create-post" onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            autoFocus
          />

          <div className="image-input">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
              placeholder="Image or GIF URL (optional)"
            />
            <button type="button" className="ghost small" onClick={addImage}>Add</button>
          </div>

          {imageUrls.length > 0 && (
            <div className="image-previews">
              {imageUrls.map((url) => (
                <div key={url} className="image-preview">
                  <img src={url} alt="" onError={(e) => e.currentTarget.classList.add("broken")} />
                  <button type="button" className="remove-img" onClick={() => removeImage(url)}>×</button>
                </div>
              ))}
            </div>
          )}

          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
}
