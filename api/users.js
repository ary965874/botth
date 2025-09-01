let users = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    const { userId, username } = req.body;
    if (userId && !users.find((u) => u.userId === userId)) {
      users.push({ userId, username });
    }
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    return res.status(200).json(users);
  }
}
