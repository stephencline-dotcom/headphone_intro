const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const {
  getSettings,
  saveSettings,
  getStorageMode
} = require("./settings-store");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const classroomState = {
  currentStep: 0,
  teacherControlEnabled: true,
  freezeScreenArmed: false,
  teacherPresent: false
};

let teacherLastSeen = 0;
const TEACHER_STALE_MS = 15000;

const clients = new Set();

function broadcastState() {
  const payload = `data: ${JSON.stringify(classroomState)}\n\n`;

  for (const client of clients) {
    client.write(payload);
  }
}

app.get("/api/settings", async (req, res) => {
  try {
    const settings = await getSettings();

    res.json({
      settings,
      storageMode: getStorageMode()
    });
  } catch (error) {
    console.error("Unable to load settings:", error);
    res.status(500).json({
      error: "Unable to load settings."
    });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const settings = await saveSettings(req.body);

    res.json({
      settings,
      storageMode: getStorageMode()
    });
  } catch (error) {
    console.error("Unable to save settings:", error);
    res.status(500).json({
      error: "Unable to save settings."
    });
  }
});

app.post("/api/teacher-heartbeat", (req, res) => {
  teacherLastSeen = Date.now();

  if (!classroomState.teacherPresent) {
    classroomState.teacherPresent = true;
    broadcastState();
  }

  res.json({
    ok: true,
    teacherPresent: true
  });
});

app.post("/api/teacher-leave", (req, res) => {
  teacherLastSeen = 0;

  const changed =
    classroomState.teacherPresent ||
    classroomState.freezeScreenArmed;

  classroomState.teacherPresent = false;

  // A missing teacher must never leave students frozen.
  classroomState.freezeScreenArmed = false;

  if (changed) {
    broadcastState();
  }

  res.json({
    released: true,
    classroomState
  });
});

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
    classroomState.currentStep = Math.max(0, currentStep);
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

app.post("/api/classroom-start", (req, res) => {
  classroomState.freezeScreenArmed = false;
  classroomState.teacherControlEnabled = true;
  classroomState.currentStep = 0;

  broadcastState();

  res.json(classroomState);
});

app.post("/api/classroom-reset", (req, res) => {
  // Always release Freeze before resetting lesson state.
  classroomState.freezeScreenArmed = false;
  classroomState.currentStep = 0;

  broadcastState();

  res.json(classroomState);
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

setInterval(() => {
  if (!classroomState.teacherPresent) {
    return;
  }

  const teacherIsStale =
    Date.now() - teacherLastSeen > TEACHER_STALE_MS;

  if (!teacherIsStale) {
    return;
  }

  console.log("Teacher heartbeat lost. Releasing classroom freeze.");

  classroomState.teacherPresent = false;
  classroomState.freezeScreenArmed = false;

  broadcastState();
}, 5000);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Headphone Intro running on port ${PORT}`);
});
