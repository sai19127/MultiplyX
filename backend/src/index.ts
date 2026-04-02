import express from "express";
import cors from "cors";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("MultiplyX API running 🚀");
});

app.get("/question", (_req, res) => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;

  res.status(200).json({
    question: `${a} x ${b}`,
    answer: a * b,
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});