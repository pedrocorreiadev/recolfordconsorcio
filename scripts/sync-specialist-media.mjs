import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const specialists = ["flavio", "jessica", "jersey"];
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".webm"]);
const maxVideoBytes = 50 * 1024 * 1024;

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").trim();
  }
}

function normalizeName(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function listFiles(directory) {
  const entries = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) entries.push(...listFiles(fullPath));
    if (entry.isFile()) entries.push(fullPath);
  }
  return entries;
}

function isRecognizedKind(normalizedName, specialist, kind) {
  if (!normalizedName.includes(specialist)) return false;
  if (kind === "image") return /\b(img|image|foto|photo|perfil)\b/.test(normalizedName);
  return /\b(video|vid)\b/.test(normalizedName);
}

function preferredExactName(specialist, kind) {
  return `${specialist} ${kind === "image" ? "img" : "video"}`;
}

function chooseMatch(matches, specialist, kind) {
  if (matches.length <= 1) return { match: matches[0], ambiguous: false };
  const exact = matches.filter((file) => {
    const extension = path.extname(file);
    return normalizeName(path.basename(file, extension)) === preferredExactName(specialist, kind);
  });
  if (exact.length === 1) return { match: exact[0], ambiguous: false };
  return { match: null, ambiguous: true };
}

function stableName(kind, sourcePath, specialist) {
  const extension = path.extname(sourcePath).toLowerCase();
  const normalizedBaseName = normalizeName(path.basename(sourcePath, extension));
  if (specialist === "jersey" && kind === "image" && /\b1\b/.test(normalizedBaseName)) {
    return `profile-1${extension}`;
  }

  return `${kind === "image" ? "profile" : "intro"}${extension}`;
}

function copySingle({ sourcePath, specialist, kind }) {
  const stats = statSync(sourcePath);
  if (kind === "video" && stats.size > maxVideoBytes) {
    return {
      copied: false,
      reason: "video_large",
      path: sourcePath,
      size: stats.size,
    };
  }

  const destinationDir = path.join(process.cwd(), "public", "media", "specialists", specialist);
  mkdirSync(destinationDir, { recursive: true });
  const destinationPath = path.join(destinationDir, stableName(kind, sourcePath, specialist));
  copyFileSync(sourcePath, destinationPath);
  return {
    copied: true,
    source: sourcePath,
    destination: destinationPath,
    size: stats.size,
  };
}

loadLocalEnv();

const source = process.env.LOCAL_MEDIA_SOURCE;
if (!source) {
  console.log("LOCAL_MEDIA_SOURCE não configurado. Exemplo local: D:\\img e videos");
  process.exit(0);
}

if (!existsSync(source)) {
  console.log(`Diretório de mídia não encontrado: ${source}`);
  process.exit(0);
}

const files = listFiles(source);
const report = {
  source,
  found: files.map((file) => ({ path: file, size: statSync(file).size })),
  copied: [],
  ambiguous: [],
  skipped: [],
};

for (const specialist of specialists) {
  for (const kind of ["image", "video"]) {
    const allowedExtensions = kind === "image" ? imageExtensions : videoExtensions;
    const matches = files.filter((file) => {
      const extension = path.extname(file).toLowerCase();
      return allowedExtensions.has(extension) && isRecognizedKind(normalizeName(path.basename(file, extension)), specialist, kind);
    });

    if (matches.length === 0) continue;
    const chosen = chooseMatch(matches, specialist, kind);
    if (chosen.ambiguous || !chosen.match) {
      report.ambiguous.push({ specialist, kind, files: matches });
      continue;
    }

    const result = copySingle({ sourcePath: chosen.match, specialist, kind });
    if (result.copied) report.copied.push({ specialist, kind, ...result });
    else report.skipped.push({ specialist, kind, ...result });
  }
}

console.log(JSON.stringify(report, null, 2));
