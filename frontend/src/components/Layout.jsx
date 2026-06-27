import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FiPlus, FiLogOut, FiUser } from "react-icons/fi";
import { logout, getMyId, getUser } from "../api";
import CreatePostModal from "./CreatePostModal";

export default function Layout() {
  const navigate = useNavigate();
  const myId = getMyId();
  const [me, setMe] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { getUser(myId).then(setMe); }, [myId]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn" onClick={() => setShowCreate(true)} title="Create post">
            <FiPlus />
          </button>
        </div>
        <Link to="/" className="brand">Odin-Book</Link>
        <div className="topbar-right">
          <Link to={`/users/${myId}`} className="avatar-link" title="My profile">
            {me?.pfpUrl
              ? <img src={me.pfpUrl} alt="" className="avatar-sm" />
              : <FiUser className="avatar-icon" />}
          </Link>
          <button className="icon-btn" onClick={handleLogout} title="Log out">
            <FiLogOut />
          </button>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            window.dispatchEvent(new Event("posts:changed"));
          }}
        />
      )}
    </div>
  );
}
