import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Counter from "~/components/counter";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function About() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">About!!</h1>
      <Counter />
      <Link to="/" className="text-blue-700 underline visited:text-purple-900">
        Home
      </Link>
    </div>
  );
}
