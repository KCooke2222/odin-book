import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { getPost, postComment } from "../api";

const paperTheme = {
  colors: {
    editor: { background: "#f9f6f0", text: "#1a1a1a" },
    menu: { background: "#faf8f4", text: "#1a1a1a" },
    tooltip: { background: "#1a1a1a", text: "#f9f6f0" },
    hovered: { background: "#ede9e2", text: "#1a1a1a" },
    selected: { background: "#e5e1d8", text: "#1a1a1a" },
    disabled: { background: "#f9f6f0", text: "#9ca3af" },
    shadow: "#c8c3bb",
    border: "#d4cfc8",
    sideMenu: "transparent",
    highlights: {
      gray: { background: "#f3f0ea", text: "#1a1a1a" },
    },
  },
  fontFamily: "Georgia, 'Times New Roman', serif",
};

export default function Post() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");

  const editor = useCreateBlockNote();

  useEffect(() => {
    getPost(postId).then((p) => {
      setPost(p);
      if (p.content) {
        try {
          const blocks = JSON.parse(p.content);
          editor.replaceBlocks(editor.document, blocks);
        } catch {
          editor.tryParseHTMLToBlocks(p.content).then((blocks) => {
            editor.replaceBlocks(editor.document, blocks);
          });
        }
      }
    });
  }, [postId, editor]);

  async function handleSubmit(e) {
    e.preventDefault();
    await postComment(postId, { authorName, content });
    getPost(postId).then(setPost);
    setAuthorName("");
    setContent("");
  }

  if (!post) return null;

  return (
    <div className="post-full">
      <Link className="back" to="/">← All posts</Link>
      <h1>{post.title}</h1>
      <div className="post-content">
        <BlockNoteView editor={editor} theme={paperTheme} editable={false} />
      </div>

      <div className="comments">
        <h3>{post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}</h3>

        {post.comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-author">{comment.authorName}</div>
            <div>{comment.content}</div>
          </div>
        ))}

        <form className="comment-form" onSubmit={handleSubmit}>
          <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your name" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Leave a comment" />
          <button type="submit">Post comment</button>
        </form>
      </div>
    </div>
  );
}
