import { useEffect, useState } from "react";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track Telegram user
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user?.id) {
        fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, username: user.username })
        });
      }
    }
  }, []);

  // Fetch scraped videos
  useEffect(() => {
    fetch("/api/video")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-center text-red-500">
        🔞 Exclusive Videos
      </h1>

      {loading && <p className="text-center">Loading...</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {videos.map((video, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-2">
              <h2 className="text-sm font-semibold">{video.title}</h2>
              <a
                href={video.download_links.processed_video}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-center bg-red-600 hover:bg-red-700 text-white py-1 rounded-lg"
              >
                ▶ Watch
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
