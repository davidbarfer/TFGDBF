import * as fs from 'node:fs/promises';
import { query } from './database.mjs';
import { get } from 'node:http';

export const getFileSystemBasePath = () => {
  const path = process.env.FILESYSTEM_PATH;
  if (!path) {
    throw new Error('FILESYSTEM_PATH is not defined in environment variables.');
  }
  return path;
};
export const generateFileSystem = async () => {
  const path = getFileSystemBasePath();
  // Remove existing directory and its contents for development purposes
  await fs.rm(path, { recursive: true }).catch(err => {
    if (err.code !== 'ENOENT') {
      console.error('Error removing directory:', err);
    }
  });
  // Generate file system structure
  await fs.mkdir(path, { recursive: true }).catch(err => {
    console.error('Error creating base directory:', err);
  });
  try {
    const subjects = await query('SELECT id FROM subject');
    subjects.results.forEach(async subject => {
      const practices = await query(
        'SELECT id FROM practice WHERE subject_id = ?',
        [subject.id]
      );
      const subjectPath = `${path}/${subject.id}`;
      await fs.mkdir(subjectPath, { recursive: true });
      practices.results.forEach(async practice => {
        const practicePath = `${subjectPath}/${practice.id}`;
        await fs.mkdir(practicePath, { recursive: true });
        await fs.mkdir(`${practicePath}/submissions`, { recursive: true });
        await fs.mkdir(`${practicePath}/evaluations`, { recursive: true });
      });
    });
  } catch (error) {
    console.error('Error generating file system:', error);
  }
};
export async function getFileSubmission(url) {
  const path = getFileSystemBasePath();
  const filePath = `${path}/${url}`;
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    return file;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}
