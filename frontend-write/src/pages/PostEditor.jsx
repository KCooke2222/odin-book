import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { getPost, createPost, updatePost } from "../api";

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
    sideMenu: "#9ca3af",
    highlights: {
      gray: { background: "#f3f0ea", text: "#1a1a1a" },
    },
  },
  fontFamily: "Georgia, 'Times New Roman', serif",
};

export default function PostEditor() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const editor = useCreateBlockNote();

  useEffect(() => {
    if (!id) return;
    getPost(id).then((post) => {
      setTitle(post.title);
      if (post.content) {
        try {
          const blocks = JSON.parse(post.content);
          editor.replaceBlocks(editor.document, blocks);
        } catch {
          // legacy HTML content fallback
          editor.tryParseHTMLToBlocks(post.content).then((blocks) => {
            editor.replaceBlocks(editor.document, blocks);
          });
        }
      }
    });
  }, [id, editor]);

  async function handleSave() {
    const content = JSON.stringify(editor.document);
    if (id) {
      await updatePost(id, { title, content });
    } else {
      await createPost({ title, content });
    }
    navigate("/");
  }

  return (
    <div className="editor-page">
      <div className="editor-meta">
        <Link to="/">← Dashboard</Link>
        <button onClick={handleSave}>Save</button>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="title-input"
      />
      <BlockNoteView editor={editor} theme={paperTheme} />
    </div>
  );
}
