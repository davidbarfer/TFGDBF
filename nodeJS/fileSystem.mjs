import fsnp from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';
import unzipper from 'unzipper';
import { query } from './database.mjs';
import { executeMatlabFile } from './matlabFunctions.mjs';
import { pipeline } from 'node:stream/promises';

const ERROR_MAP = util.getSystemErrorMap();
const ERROR_CODES = {
  ENOENT: ERROR_MAP.get(-2)[0],
};
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
    await fs.mkdir(`${path}/temp`, { recursive: true });
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
        await fs.mkdir(`${practicePath}/evaluator`, { recursive: true });
        // Create a MATLAB file template for testing
        await fs.writeFile(
          `${practicePath}/submissions/template.m`,
          '% PLANTILLA \nA1 = 1;',
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
        if (error.code === ERROR_CODES.ENOENT) {
          await query('UPDATE submissions SET file_url = NULL WHERE id = ?', [
            file_params.submission_id,
          ]);
          console.error('File does not exist:', error);
        } else {
          console.error('Error reading submission file:', error);
          return null;
        }
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
    return 500;
  }
  try {
    await executeMatlabFile(filePath);
  } catch (error) {
    console.error('Error executing student submision:', error);
    fs.unlink(filePath);
    return 400;
  }
  try {
    const fileUrlResponse = await query(
      'UPDATE submissions SET file_url = ? WHERE id = ?',
      [url, submission_id]
    );
    if (fileUrlResponse.results.affectedRows === 0) {
      console.error('No rows were updated in the database.');
      fs.unlink(filePath);
      return 500;
    }
    return 201;
  } catch (error) {
    console.error('Error updating database:', error);
    fs.unlink(filePath);
    return 500;
  }
}
export async function saveFileSubmissionTemplate(url, content, practice_id) {
  const path = getFileSystemBasePath();
  const filePath = `${path}/${url}`;
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    console.error('Error writing file:', error);
    return 500;
  }
  try {
    await executeMatlabFile(filePath);
  } catch (error) {
    console.error('Error executing student submision:', error);
    fs.unlink(filePath);
    return 400;
  }
  try {
    const fileUrlResponse = await query(
      'UPDATE practice SET submissions_template_url = ? WHERE id = ?',
      [url, practice_id]
    );
    if (fileUrlResponse.results.affectedRows === 0) {
      console.error('No rows were updated in the database.');
      fs.unlink(filePath);
      return 500;
    }
    return 201;
  } catch (error) {
    console.error('Error updating database:', error);
    fs.unlink(filePath);
    return 500;
  }
}

/**
 * Descomprime un archivo .zip en la ruta especificada.
 * @param {string} zipPath - Ruta absoluta o relativa al archivo .zip
 * @param {string} outputPath - Directorio donde se extraerán los archivos
 */
export async function extractZip(zipPath, outputPath) {
  try {
    // 1. Verificar si el archivo ZIP existe antes de empezar
    await fs.access(zipPath);

    // 2. Asegurar que la carpeta de destino existe (recursivo)
    await fs.mkdir(outputPath, { recursive: true });

    // 3. Crear los flujos (streams)
    const readStream = fsnp.createReadStream(zipPath);
    const extractor = unzipper.Extract({ path: outputPath });

    // 4. Ejecutar la descompresión
    // pipeline gestiona automáticamente el cierre de streams y captura errores
    await pipeline(readStream, extractor);

    return {
      success: true,
      message: `Extracción completada en ${path.resolve(outputPath)}`,
      path: outputPath,
    };
  } catch (error) {
    // Manejo de errores específicos
    if (error.code === 'ENOENT') {
      throw new Error(`El archivo original no existe en: ${zipPath}`);
    }
    throw new Error(`Error al descomprimir: ${error.message}`);
  }
}
