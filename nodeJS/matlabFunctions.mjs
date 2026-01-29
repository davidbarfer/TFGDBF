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
