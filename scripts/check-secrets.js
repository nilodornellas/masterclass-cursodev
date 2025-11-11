const { execSync } = require("child_process");

console.log("🔍 Checking staged files for sensitive information...");

const stagedFiles = execSync(
  "git diff --cached --name-only --diff-filter=ACM",
  {
    encoding: "utf-8",
  },
)
  .split("\n")
  .filter((f) => f.trim() !== "");

const ignoredFiles = [
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  ".env.example",
  "README.md",
  ".gitignore",
];

if (stagedFiles.length === 0) {
  console.log("ℹ️ No staged files to check.");
  process.exit(0);
}

const patterns = [
  // AWS
  /AKIA[0-9A-Z]{16}/, // AWS Access Key ID
  /aws_secret_access_key\s*=\s*['"][A-Za-z0-9/+=]{40}['"]/i,

  // Google / Firebase
  /AIza[0-9A-Za-z\\-_]{35}/, // Google API Key
  /firebase(?:_|-)?api(?:_|-)?key/i,

  // Generic API Keys / Tokens
  /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9_-]{16,}['"]/i,
  /token\s*[:=]\s*['"][A-Za-z0-9_-]{16,}['"]/i,
  /secret\s*[:=]\s*['"][A-Za-z0-9_-]{16,}['"]/i,
  /bearer\s+[A-Za-z0-9_.=-]+/i,

  // GitHub / GitLab tokens
  /ghp_[A-Za-z0-9]{36}/, // GitHub Personal Access Token
  /glpat-[A-Za-z0-9\-=_]{20,}/, // GitLab Personal Token

  // Slack / Discord / Stripe
  /xox[baprs]-[A-Za-z0-9-]{10,48}/, // Slack token
  /sk_live_[0-9a-zA-Z]{24,}/, // Stripe live key
  /mfa\.[A-Za-z0-9_-]{20,}/, // MFA token

  // JWT (JSON Web Token)
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]{10,}\.[A-Za-z0-9._-]{10,}/,

  // Private keys
  /-----BEGIN (RSA|DSA|EC|PGP|OPENSSH) PRIVATE KEY-----/,
];

function checkFile(file) {
  if (ignoredFiles.includes(file)) return null;

  try {
    const content = execSync(`git show :${file}`, { encoding: "utf-8" });
    const matched = patterns.find((regex) => regex.test(content));
    return matched ? file : null;
  } catch {
    return null;
  }
}

const suspiciousFiles = stagedFiles.map(checkFile).filter(Boolean);

if (suspiciousFiles.length > 0) {
  console.error("🚨 Possible sensitive data detected in:");
  suspiciousFiles.forEach((file) => console.error(`  🔸 ${file}`));
  console.error(
    "\n❌ Commit canceled. Remove or mask sensitive information before committing.",
  );
  process.exit(1);
}

console.log("✅ No secrets detected in staged files.");
process.exit(0);
