import React from "react";
export default function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="bg-blue-500 text-gray-500 p-2 rounded-md hover:bg-blue-600 my-2"
      >
        Increment
      </button>
    </div>
  );
}
