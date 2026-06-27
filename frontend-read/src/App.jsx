import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="site">
      <header>
        <h1><Link to="/" style={{ textDecoration: "none" }}>The Blog</Link></h1>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
