import { exec } from 'child_process';
import path from 'path';
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
  const matlabPath = path.resolve('/usr/local/MATLAB/R2024b/bin/matlab'); // Replace with your MATLAB path
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
