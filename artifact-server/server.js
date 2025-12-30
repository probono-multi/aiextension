import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 9090;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve artifacts directory correctly
const artifactsPath = path.join(__dirname, '..', 'artifacts');

app.use('/artifacts', express.static(artifactsPath));

app.listen(PORT, () => {
  console.log(`Artifact server running at http://localhost:${PORT}/artifacts`);
});
