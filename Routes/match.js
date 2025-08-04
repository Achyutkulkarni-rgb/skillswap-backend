const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Skill match route
router.post("/match", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findOne({ email: decoded.email });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { skills_have, skills_want } = req.body;

    if (!skills_have || !skills_want || !Array.isArray(skills_have) || !Array.isArray(skills_want)) {
      return res.status(400).json({ error: "skills_have and skills_want must be arrays" });
    }

    const matches = await User.find({
      skills_have: { $in: skills_want },
      skills_want: { $in: skills_have },
      email: { $ne: decoded.email }, // Exclude current user
    });

    const formattedMatches = matches.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      skills_have: user.skills_have,
    }));

    res.json(formattedMatches);
  } catch (err) {
    console.error("Token verification or match error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;
