#!/usr/bin/env node
/**
 * Never ship client legal docs or listing photos from a leftover public/ai_food.
 * Vite copies public/ into the build output, so this must run before prebuild.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicAiFood = path.join(root, 'public', 'ai_food');

fs.rmSync(publicAiFood, { recursive: true, force: true });
