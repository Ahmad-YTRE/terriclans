import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/requests.json");

export default function handler(req, res) {
  if (req.method === "POST") {
    const data = JSON.parse(fs.readFileSync(filePath));
    const { clanName, description } = req.body;

    data.push({ id: Date.now(), clanName, description, status: "pending" });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    const data = JSON.parse(fs.readFileSync(filePath));
    return res.status(200).json(data);
  }

  if (req.method === "PATCH") {
    const { password, id, action } = req.body;
    if (password !== process.env.ADMIN_PASSWORD)
      return res.status(401).json({ error: "Unauthorized" });

    const data = JSON.parse(fs.readFileSync(filePath));
    const request = data.find((r) => r.id === id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.status = action === "approve" ? "approved" : "rejected";
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return res.status(200).json({ success: true });
  }

  // If method is not handled, return 405
  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
