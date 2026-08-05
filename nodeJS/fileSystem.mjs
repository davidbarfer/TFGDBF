import fsnp from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';
import unzipper from 'unzipper';
import { query } from './database.mjs';
import { executeMatlabFile } from './matlabFunctions.mjs';
import { pipeline } from 'node:stream/promises';
import { logger } from './logger.mjs';

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
export const generateFileSystem = async (options = { isProduction: false }) => {
  const path = getFileSystemBasePath();
  if (!options.isProduction) {
    // Remove existing directory and its contents for development purposes
    await fs.rm(path, { recursive: true }).catch(err => {
      if (err.code !== 'ENOENT') {
        logger.error('Error al eliminar el directorio en generateFileSystem:', {
          error: err.message,
          stack: err.stack,
        });
      }
    });
  }
  // Generate file system structure
  await fs.mkdir(path, { recursive: true }).catch(err => {
    logger.error('Error al crear el directorio base en generateFileSystem:', {
      error: err.message,
      stack: err.stack,
    });
  });
  try {
    await fs.mkdir(`${path}/temp`, { recursive: true });
    await fs.mkdir(`${path}/logs`, { recursive: true });
    const subjects = await query('SELECT id FROM v_subject');
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
        if (!options.isProduction) {
          // Create a MATLAB file template for testing
          await fs.writeFile(
            `${practicePath}/submissions/template.m`,
            '% PLANTILLA \nA1 = 1;',
            'utf8'
          );
        }
      });
    });
  } catch (error) {
    logger.error(
      'Error al generar el sistema de archivos en generateFileSystem:',
      {
        error: error.message,
        stack: error.stack,
      }
    );
  }
};
export async function generateFolder(folderPath) {
  const basePath = getFileSystemBasePath();
  const folderFullPath = path.join(basePath, folderPath);
  try {
    await fs.mkdir(folderFullPath);
  } catch (error) {
    logger.error('Error en generateFolder: ', {
      error: error.message,
      stack: error.stack,
    });
    return 500;
  }
}
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
          logger.error('El archivo no existe en getFileSubmission:', {
            error: error.message,
            stack: error.stack,
          });
        } else {
          logger.error(
            'Error al leer el archivo de envío en getFileSubmission:',
            {
              error: error.message,
              stack: error.stack,
            }
          );
          return null;
        }
      }
    }
  } catch (error) {
    logger.error(
      'Error al consultar la base de datos para obtener la URL del archivo en getFileSubmission:',
      {
        error: error.message,
        stack: error.stack,
      }
    );
  }
  if (url) {
    const templateFilePath = `${path}/${url}`;
    try {
      const templateFile = await fs.readFile(templateFilePath, 'utf-8');
      return templateFile;
    } catch (error) {
      logger.error(
        'Error al leer el archivo de plantilla en getFileSubmission:',
        {
          error: error.message,
          stack: error.stack,
        }
      );
      return null;
    }
  } else return null;
}
export async function saveFileSubmission(url, content, submission_id) {
  const path = getFileSystemBasePath();
  const filePath = `${path}/${url}`;
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    logger.error('Error al escribir el archivo en saveFileSubmission:', {
      error: error.message,
      stack: error.stack,
    });
    return 500;
  }
  try {
    await executeMatlabFile(filePath);
  } catch (error) {
    logger.error(
      'Error al ejecutar el envío del alumno en «saveFileSubmission»:',
      {
        error: error.message,
        stack: error.stack,
      }
    );
    fs.unlink(filePath);
    return 400;
  }
  try {
    const fileUrlResponse = await query(
      'UPDATE submissions SET file_url = ? WHERE id = ?',
      [url, submission_id]
    );
    if (fileUrlResponse.results.affectedRows === 0) {
      logger.error(
        'No se ha actualizado ninguna fila en la base de datos al guardar el envío del archivo.'
      );
      fs.unlink(filePath);
      return 500;
    }
    return 201;
  } catch (error) {
    logger.error(
      'Error al actualizar la base de datos al guardar el envío del archivo:',
      {
        error: error.message,
        stack: error.stack,
      }
    );
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
    logger.error(
      'Error al escribir el archivo en «saveFileSubmissionTemplate»:',
      {
        error: error.message,
        stack: error.stack,
      }
    );
    return 500;
  }
  try {
    await executeMatlabFile(filePath);
  } catch (error) {
    logger.error(
      'Error al ejecutar el envío del alumno en «saveFileSubmissionTemplate»:',
      {
        error: error.message,
        stack: error.stack,
      }
    );
    fs.unlink(filePath);
    return 400;
  }
  try {
    const fileUrlResponse = await query(
      'UPDATE practice SET submissions_template_url = ? WHERE id = ?',
      [url, practice_id]
    );
    if (fileUrlResponse.results.affectedRows === 0) {
      logger.error(
        'No se ha actualizado ninguna fila en la base de datos al ejecutar «saveFileSubmissionTemplate».'
      );
      fs.unlink(filePath);
      return 500;
    }
    return 201;
  } catch (error) {
    logger.error(
      'Error al actualizar la base de datos en «saveFileSubmissionTemplate»:',
      {
        error: error.message,
        stack: error.stack,
      }
    );
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
export async function clearTempDirectory(tempPath) {
  try {
    // 1. Read all files and subdirectories within the path
    const files = await fs.readdir(tempPath);
    // 2. Delete each item individually
    // Using Promise.all for faster, concurrent deletion
    await Promise.all(
      files.map(file =>
        fs.rm(path.join(tempPath, file), { recursive: true, force: true })
      )
    );
    return true;
  } catch (err) {
    // If the directory doesn't exist, we treat it as a success
    if (err.code === 'ENOENT') {
      return true;
    }
    logger.error('Error al borrar el directorio TEMP:', {
      error: err.message,
      stack: err.stack,
    });
    return false;
  }
}
