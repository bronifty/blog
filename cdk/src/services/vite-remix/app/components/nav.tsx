import { Link } from "@remix-run/react";

export default function Nav() {
  return (
    <nav className="grid grid-cols-2 my-4">
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}
