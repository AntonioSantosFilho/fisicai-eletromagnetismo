// Publica as imagens existentes na web sem modificar seus pixels.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const destination = path.join(root, "public", "branding");
fs.mkdirSync(destination, { recursive: true });
for (const [source, target] of [
  ["icon.png", "app-icon.png"],
  ["favicon.png", "favicon.png"],
]) {
  const original = fs.readFileSync(path.join(root, "assets", "images", source));
  const file = path.join(destination, target);
  if (!fs.existsSync(file) || !fs.readFileSync(file).equals(original))
    fs.writeFileSync(file, original);
}
console.log("Marca FisicAI sincronizada para a web.");
