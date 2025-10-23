import * as fs from 'node:fs/promises';
import { query } from './database.mjs';

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
        // Create a MATLAB file template for testing
        await fs.writeFile(
          `${practicePath}/submissions/template.m`,
          'A1 = 1;',
          'utf8'
        );
      });
    });
  } catch (error) {
    console.error('Error generating file system:', error);
  }
};
export async function getFileSubmission(url, file_params) {
  const path = getFileSystemBasePath();
  try {
    const filePathQuery = await query(
      'SELECT file_url FROM submissions WHERE id = ?',
      [file_params.submission_id]
    );
    if (
      filePathQuery.results.length > 0 &&
      filePathQuery.results[0].file_url !== null
    ) {
      const filePath = `${path}/${filePathQuery.results[0].file_url}`;
      try {
        const file = await fs.readFile(filePath, 'utf-8');
        return file;
      } catch (error) {
        console.error('Error reading submission file:', error);
        return null;
      }
    }
  } catch (error) {
    console.error('Error querying database for file URL:', error);
  }
  const templateFilePath = `${path}/${url}`;
  try {
    const templateFile = await fs.readFile(templateFilePath, 'utf-8');
    return templateFile;
  } catch (error) {
    console.error('Error reading template file:', error);
    return null;
  }
}
export async function saveFileSubmission(url, content, submission_id) {
  const path = getFileSystemBasePath();
  const filePath = `${path}/${url}`;
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
  try {
    const fileUrlResponse = await query(
      'UPDATE submissions SET file_url = ? WHERE id = ?',
      [url, submission_id]
    );
    if (fileUrlResponse.results.affectedRows === 0) {
      console.error('No rows were updated in the database.');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error updating database:', error);
    return false;
  }
}
