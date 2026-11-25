#!/usr/bin/env node
/* ============================================================
   Gera src/assets/voice/manifest.json com os arquivos realmente
   presentes. O app só tenta tocar o que está listado aqui —
   assim nunca há 404 de narração.

   Uso: node scripts/gerar_manifesto_voz.mjs
   ============================================================ */
import { readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR = join(AQUI, '..', 'src', 'assets', 'voice');

const arquivos = readdirSync(DIR)
  .filter(f => f.endsWith('.mp3'))
  .sort();

const detalhes = arquivos.map(f => ({ arquivo: f, bytes: statSync(join(DIR, f)).size }));

writeFileSync(join(DIR, 'manifest.json'), JSON.stringify({
  geradoEm: new Date().toISOString(),
  total: arquivos.length,
  arquivos,
  detalhes,
}, null, 2));

console.log(`manifesto: ${arquivos.length} clipe(s) em src/assets/voice/`);
console.log(arquivos.join('\n'));
