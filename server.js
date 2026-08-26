const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const classroomState = {
  currentStep: 0,
  teacherControlEnabled: true,
  freezeScreenArmed: false
};

const clients = new Set();

function broadcastState() {
  const payload = `data: ${JSON.stringify(classroomState)}\n\n`;

  for (const client of clients) {
    client.write(payload);
  }
}

app.get("/api/classroom-state", (req, res) => {
  res.json(classroomState);
});

app.post("/api/classroom-state", (req, res) => {
  const {
    currentStep,
    teacherControlEnabled,
    freezeScreenArmed
  } = req.body;

  if (Number.isInteger(currentStep)) {
    classroomState.currentStep = Math.max(0, Math.min(2, currentStep));
  }

  if (typeof teacherControlEnabled === "boolean") {
    classroomState.teacherControlEnabled = teacherControlEnabled;
  }

  if (typeof freezeScreenArmed === "boolean") {
    classroomState.freezeScreenArmed = freezeScreenArmed;
  }

  broadcastState();

  res.json(classroomState);
});

app.post("/api/classroom-release", (req, res) => {
  classroomState.freezeScreenArmed = false;
  broadcastState();

  res.json({
    released: true,
    classroomState
  });
});

app.get("/api/classroom-events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  clients.add(res);

  res.write(`data: ${JSON.stringify(classroomState)}\n\n`);

  req.on("close", () => {
    clients.delete(res);
  });
});

app.get("/teacher", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "teacher.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Headphone Intro running on port ${PORT}`);
});
