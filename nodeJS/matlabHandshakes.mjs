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
