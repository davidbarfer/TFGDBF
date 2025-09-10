import * as fs from 'node:fs/promises';

export const getFileSystemPath = () => {
  const path = process.env.FILESYSTEM_PATH;
  if (!path) {
    throw new Error('FILESYSTEM_PATH is not defined in environment variables.');
  }
  return path;
};
export const generateFileSystem = async () => {
  const path = getFileSystemPath();
  await fs.mkdir(path, { recursive: true });
  await fs.mkdir(`${path}/templates`, { recursive: true });
  await fs.mkdir(`${path}/submissions`, { recursive: true });
};

export const getTemplatesPath = () => {
  const path = getFileSystemPath();
  return `${path}/templates`;
};

export const getSubmissionsPath = () => {
  const path = getFileSystemPath();
  return `${path}/submissions`;
};
