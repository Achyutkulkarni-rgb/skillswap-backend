const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
router.post("/match", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findOne({ email: decoded.email });

    const { skills_have, skills_want } = req.body;

    const matches = await User.find({
      skills_have: { $in: skills_want },
      skills_want: { $in: skills_have },
      email: { $ne: decoded.email }, // Exclude self
    });

    const clean = matches.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email, // ✅ Email included
      skills_have: user.skills_have,
    }));

    res.json(clean);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
