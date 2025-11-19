const { spawn, execSync } = require("node:child_process");

const run = (cmd) =>
  execSync(cmd, {
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "true" },
  });

const stop = () => {
  console.log("\n\n🔴 Stop Services...");
  run("npm run services:stop");
};

function dev() {
  run("npm run services:up");
  run("npm run services:wait:database");
  run("npm run migrations:up");

  const child = spawn("next", ["dev"], {
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "true" },
  });

  child.on("close", stop);
}

process.on("SIGINT", () => {
  stop();
  process.exit(0);
});

dev();
