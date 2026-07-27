export const unhandledUserDefinedException = '45000';
export const SERVER_ERRORS = {
  internalServerError: 'Error interno del servidor',
  unauthorized: 'No autorizado',
  notFound: 'No encontrado',
  badRequest: 'Petición incorrecta',
  forbidden: 'Prohibido',
};
export const AUTH_ERRORS = {
  jsonInvalid: 'JSON inválido',
  credentialsInvalid: 'Usuario o contraseña incorrectos',
  credentialsRequired: 'Usuario y contraseña requeridos',
  accountPendingApproval:
    'Tu cuenta está pendiente de aprobación por un administrador',
  adminCreationNotAllowed: 'Creación de administrador no permitida',
  userAlreadyExists: 'El usuario ya existe',
};
export const AUTH_SUCCESS = {
  loginSuccessful: 'Inicio de sesión exitoso',
  logoutSuccessful: 'Cierre de sesión exitoso',
  signupSuccessful: 'Usuario registrado con éxito',
  signupSucessfulWaitingForAdminApproval:
    'Usuario registrado con éxito. Esperando aprobación del administrador',
};
export const EXPORT_ERRORS = {
  dataNotFound: 'No se encontraron datos para la exportación',
};
