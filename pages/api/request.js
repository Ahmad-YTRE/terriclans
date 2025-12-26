import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/requests.json");

// Ensure JSON file exists
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");

export default async function handler(req, res) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));

    if (req.method === "POST") {
      const { clanName, description } = req.body;
      if (!clanName || !description)
        return res.status(400).json({ error: "Missing fields" });

      const newRequest = {
        id: Date.now(),
        clanName,
        description,
        status: "pending",
      };
      data.push(newRequest);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return res.status(200).json({ success: true, request: newRequest });
    }

    if (req.method === "GET") {
      return res.status(200).json(data);
    }

    if (req.method === "PATCH") {
      const { password, id, action } = req.body;
      if (password !== process.env.ADMIN_PASSWORD)
        return res.status(401).json({ error: "Unauthorized" });

      const request = data.find((r) => r.id === id);
      if (!request) return res.status(404).json({ error: "Request not found" });

      request.status = action === "approve" ? "approved" : "rejected";
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      return res.status(200).json({ success: true });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
