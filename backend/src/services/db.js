import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

export const db = {
  async read(collection) {
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  },

  async write(collection, data) {
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  },

  async findById(collection, id) {
    const items = await this.read(collection);
    return items.find(item => item.id === id);
  },

  async insert(collection, item) {
    const items = await this.read(collection);
    items.push(item);
    await this.write(collection, items);
    return item;
  }
};
