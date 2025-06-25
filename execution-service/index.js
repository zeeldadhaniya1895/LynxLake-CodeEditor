const express = require("express");
const cors = require("cors");
const config = require("./config/index");
const Docker = require('dockerode');
const tmp = require('tmp');
const fs = require('fs-extra');
const path = require('path');
const docker = new Docker();

const PORT = config.PORT || 5002;
const app = express();

// CORS middleware
app.use(cors({
    origin: [config.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    credentials: true
}));

// Add JSON body parser
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`[Execution Service] ${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Health check
app.get("/health", (_, res) => res.json({ 
    status: "Execution Service is running", 
    port: PORT,
    message: "Code compilation features coming soon!"
}));

const LANGUAGE_CONFIG = {
  python: {
    image: 'python:3.10',
    filename: 'main.py',
    runCmd: ['python', 'main.py'],
  },
  javascript: {
    image: 'node:18',
    filename: 'main.js',
    runCmd: ['node', 'main.js'],
  },
  c: {
    image: 'gcc:latest',
    filename: 'main.c',
    runCmd: ['sh', '-c', 'gcc main.c -o main && ./main'],
  },
  cpp: {
    image: 'gcc:latest',
    filename: 'main.cpp',
    runCmd: ['sh', '-c', 'g++ main.cpp -o main && ./main'],
  },
  java: {
    image: 'openjdk:17',
    filename: 'Main.java',
    runCmd: ['sh', '-c', 'javac Main.java && java Main'],
  },
};

app.post('/execute', async (req, res) => {
  const { code, language, input } = req.body;
  if (!code || !language) return res.status(400).json({ success: false, message: 'Missing code or language' });
  const config = LANGUAGE_CONFIG[language.toLowerCase()];
  if (!config) return res.json({ success: false, message: 'Language not supported' });

  // 1. Create temp dir & file
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  const filePath = path.join(tmpDir.name, config.filename);
  await fs.writeFile(filePath, code);
  let inputFilePath;
  if (input) {
    inputFilePath = path.join(tmpDir.name, 'input.txt');
    await fs.writeFile(inputFilePath, input);
  }

  try {
    // 2. Pull image if not present
    await new Promise((resolve, reject) => {
      docker.pull(config.image, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err, output) => {
          if (err) reject(err); else resolve(output);
        });
      });
    });
    // 3. Run Docker container
    const container = await docker.createContainer({
      Image: config.image,
      Cmd: config.runCmd,
      HostConfig: {
        Binds: [`${tmpDir.name}:/code`],
        AutoRemove: true,
        NetworkMode: 'none',
        Memory: 128 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000,
      },
      WorkingDir: '/code',
      Tty: false,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: !!input,
      StdinOnce: !!input,
    });
    const stream = await container.attach({ stream: true, stdout: true, stderr: true, stdin: !!input });
    let output = '';
    stream.on('data', (chunk) => { output += chunk.toString(); });

    await container.start();
    // If input is provided, write to stdin
    if (input) {
      stream.write(input);
      stream.end();
    }
    // Timeout logic (5 seconds)
    const timeout = 5000;
    const waitPromise = container.wait();
    const result = await Promise.race([
      waitPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Execution timed out')), timeout))
    ]);
    tmpDir.removeCallback();
    res.json({ success: true, output });
  } catch (err) {
    tmpDir.removeCallback();
    res.json({ success: false, error: err.message });
  }
});

app.post("/compile", (req, res) => {
    res.json({ 
        success: false, 
        message: "Code compilation service is not implemented yet" 
    });
});

// Start Server
app.listen(PORT, () => console.log(`Execution Service listening on port ${PORT}`)); 