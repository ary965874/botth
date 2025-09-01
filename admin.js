import { useEffect, useState } from "react";

export default function Admin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <h1 className="text-2xl font-bold text-red-400 mb-4">👑 Admin Panel</h1>
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-lg mb-2">Total Users: {users.length}</h2>
        <ul className="space-y-1">
          {users.map((u, i) => (
            <li
              key={i}
              className="p-2 bg-gray-700 rounded-md flex justify-between"
            >
              <span>ID: {u.userId}</span>
              {u.username && <span>@{u.username}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

