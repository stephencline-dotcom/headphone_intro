const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

const TEACHER_PASSWORD =
  process.env.TEACHER_PASSWORD || "typing1";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "headphone-heroes-development-secret";

const {
  getSettings,
  saveSettings,
  getStorageMode
} = require("./settings-store");

app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

function requireTeacher(req, res, next) {
  if (req.session?.teacherAuthenticated) {
    next();
    return;
  }

  res.status(401).json({
    error: "Teacher sign-in required."
  });
}

app.get("/student", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "student.html")
  );
});

app.get("/teacher-login", (req, res) => {
  if (req.session?.teacherAuthenticated) {
    res.redirect("/teacher");
    return;
  }

  res.sendFile(
    path.join(__dirname, "public", "teacher-login.html")
  );
});

app.post("/api/teacher-login", (req, res) => {
  const { password } = req.body;

  if (password !== TEACHER_PASSWORD) {
    res.status(401).json({
      authenticated: false
    });
    return;
  }

  req.session.teacherAuthenticated = true;

  res.json({
    authenticated: true
  });
});

app.post("/api/teacher-logout", requireTeacher, (req, res) => {
  /*
    Safety rule:
    release Freeze BEFORE clearing the teacher session.
  */
  classroomState.freezeScreenArmed = false;
  classroomState.teacherPresent = false;
  teacherLastSeen = 0;

  broadcastState();

  req.session.destroy(() => {
    res.json({
      loggedOut: true
    });
  });
});

app.get("/teacher", (req, res) => {
  if (!req.session?.teacherAuthenticated) {
    res.redirect("/teacher-login");
    return;
  }

  res.sendFile(
    path.join(__dirname, "private", "teacher.html")
  );
});

app.get("/present", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "present.html")
  );
});

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
  const payload =
    `data: ${JSON.stringify(classroomState)}\n\n`;

  for (const client of clients) {
    client.write(payload);
  }
}

/* ===== Persistent teacher settings ===== */

app.get("/api/settings", requireTeacher, async (req, res) => {
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

app.post("/api/settings", requireTeacher, async (req, res) => {
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

/* ===== Teacher presence ===== */

app.post(
  "/api/teacher-heartbeat",
  requireTeacher,
  (req, res) => {
    teacherLastSeen = Date.now();

    if (!classroomState.teacherPresent) {
      classroomState.teacherPresent = true;
      broadcastState();
    }

    res.json({
      ok: true,
      teacherPresent: true
    });
  }
);

app.post(
  "/api/teacher-leave",
  requireTeacher,
  (req, res) => {
    teacherLastSeen = 0;

    const changed =
      classroomState.teacherPresent ||
      classroomState.freezeScreenArmed;

    classroomState.teacherPresent = false;

    /*
      A missing teacher must never leave
      students frozen.
    */
    classroomState.freezeScreenArmed = false;

    if (changed) {
      broadcastState();
    }

    res.json({
      released: true,
      classroomState
    });
  }
);

/* ===== Shared classroom state ===== */

app.get("/api/classroom-state", (req, res) => {
  res.json(classroomState);
});

app.post(
  "/api/classroom-state",
  requireTeacher,
  (req, res) => {
    const {
      currentStep,
      teacherControlEnabled,
      freezeScreenArmed
    } = req.body;

    if (Number.isInteger(currentStep)) {
      classroomState.currentStep =
        Math.max(0, currentStep);
    }

    if (typeof teacherControlEnabled === "boolean") {
      classroomState.teacherControlEnabled =
        teacherControlEnabled;
    }

    if (typeof freezeScreenArmed === "boolean") {
      classroomState.freezeScreenArmed =
        freezeScreenArmed;
    }

    broadcastState();

    res.json(classroomState);
  }
);

app.post(
  "/api/classroom-release",
  requireTeacher,
  (req, res) => {
    classroomState.freezeScreenArmed = false;

    broadcastState();

    res.json({
      released: true,
      classroomState
    });
  }
);

app.post(
  "/api/classroom-start",
  requireTeacher,
  (req, res) => {
    classroomState.freezeScreenArmed = false;
    classroomState.teacherControlEnabled = true;
    classroomState.currentStep = 0;

    broadcastState();

    res.json(classroomState);
  }
);

app.post(
  "/api/classroom-reset",
  requireTeacher,
  (req, res) => {
    /*
      Always release Freeze before
      resetting lesson state.
    */
    classroomState.freezeScreenArmed = false;
    classroomState.currentStep = 0;

    broadcastState();

    res.json(classroomState);
  }
);

/* ===== Student/presentation live updates ===== */

app.get("/api/classroom-events", (req, res) => {
  res.setHeader(
    "Content-Type",
    "text/event-stream"
  );

  res.setHeader(
    "Cache-Control",
    "no-cache"
  );

  res.setHeader(
    "Connection",
    "keep-alive"
  );

  res.flushHeaders();

  clients.add(res);

  res.write(
    `data: ${JSON.stringify(classroomState)}\n\n`
  );

  req.on("close", () => {
    clients.delete(res);
  });
});

/* ===== Teacher heartbeat watchdog ===== */

setInterval(() => {
  if (!classroomState.teacherPresent) {
    return;
  }

  const teacherIsStale =
    Date.now() - teacherLastSeen >
    TEACHER_STALE_MS;

  if (!teacherIsStale) {
    return;
  }

  console.log(
    "Teacher heartbeat lost. Releasing classroom freeze."
  );

  classroomState.teacherPresent = false;
  classroomState.freezeScreenArmed = false;

  broadcastState();
}, 5000);

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Headphone Intro running on port ${PORT}`
  );
});
