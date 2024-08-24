import type { MetaFunction } from "@remix-run/node";
import Counter from "~/components/counter";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div>
      <h1>Home</h1>
      <Counter />
    </div>
  );
}
