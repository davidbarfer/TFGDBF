import { exec } from 'child_process';
import path from 'path';
export const matlabPath = path.resolve(process.env.MATLAB_PATH);
export function connectHandshake(request) {
  const response = {
    type: 'evaluation_result',
    result: 1,
    timestamp: new Date().toISOString(),
    id: request.id,
  };
  return response;
}
export const errorHandshake = {
  type: 'error',
  message: 'Invalid JSON format',
  id: null,
};

export const launchMatlabClient = () => {
  const matlabClientPath = path.resolve('../MATLAB/TCPclient.m'); // Replace with your MATLAB path

  return new Promise((resolve, reject) => {
    const matlab = exec(
      `${matlabPath} -batch "run('${matlabClientPath}')"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error('MATLAB launch error:', error);
          reject(error);
          return;
        }
        console.log('MATLAB output:', stdout);
        if (stderr) console.error('MATLAB errors:', stderr);
      }
    );

    // Give MATLAB time to start up and connect
    setTimeout(() => resolve(matlab), 5000);
  });
};

export function executeMatlabFile(filePath) {
  return new Promise((resolve, reject) => {
    exec(
      `${matlabPath} -batch "run('${filePath}')"`,
      // `${matlabPath} -batch "${content}"`,
      // eslint-disable-next-line no-unused-vars
      (error, stdout, _stderr) => {
        // error: exec error containig matlab error
        // stdout: matlab output
        // stderr: matlab error
        if (error) {
          reject(error);
        }
        resolve(stdout);
      }
    );
  });
}

/**
 * Executes multiple MATLAB files in a single persistent workspace.
 * @param {string[]} filePaths - An array of absolute or relative paths to .m files.
 * @returns {Promise<string>} - The combined stdout from MATLAB.
 */
export function executeMatlabFiles(filePaths) {
  return new Promise((resolve, reject) => {
    // 1. Transform ['a.m', 'b.m'] into "run('a.m'); run('b.m');"
    const runCommands = filePaths.map(path => `run('${path}')`).join('; ');

    // 2. Execute as a single batch operation
    exec(
      `${matlabPath} -batch "${runCommands} ;disp(s);"`,
      // eslint-disable-next-line no-unused-vars
      (error, stdout, _stderr) => {
        if (error) {
          // Note: If one file fails, MATLAB stops and rejects here
          return reject(error);
        }
        resolve(stdout);
      }
    );
  });
}
/**
 * From s variable printed in stdout, it will extract the Grade
 * @param {string} stdout
 */
export function extractGrade(stdout) {
  // Explicación del Regex:
  // Nota    -> Busca literalmente la palabra "Nota"
  // \s+     -> Busca uno o más espacios después
  // ([\d.]+) -> Captura el grupo que contiene dígitos o puntos (el número)
  const regex = /Nota\s+([\d.]+)/;

  const matchedString = stdout.match(regex);

  // Si encuentra la coincidencia, devuelve el valor como número, sino devuelve null
  return matchedString ? parseFloat(matchedString[1]) : null;
}
