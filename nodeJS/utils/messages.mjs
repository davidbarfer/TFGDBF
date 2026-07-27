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
export const GROUPS_ERRORS = {
  groupNotFound: 'Grupo no encontrado',
  groupArrayRequired: 'Se requiere un array de grupos válido',
  groupDataRequired: 'Se requiere datos de grupo válidos',
  userNotFound: 'Usuario no encontrado en el grupo',
  groupNotAffected: 'No se ha afectado al grupo',
};
export const GROUPS_SUCCESS = {
  groupDeleted: 'Grupo eliminado con éxito',
  userDeletedFromGroup: 'Usuario eliminado con éxito del grupo',
  groupUpdated: 'Grupo actualizado con éxito',
};
export const PRACTICES_ERRORS = {
  practiceNotFound: 'Práctica no encontrada',
  practiceDataRequired: 'Se requiere datos de práctica válidos',
};
export const SUBJECTS_ERRORS = {
  subjectNotFound: 'Asignatura no encontrada',
  userNotFound: 'Usuario no encontrado en la asignatura',
  subjectNotFoundInUser: 'Asignatura no encontrada para el usuario',
  subjectDataRequired: 'Se requiere datos de asignatura válidos',
};
export const SUBJECTS_SUCCESS = {};
export const SUBMISSIONS_ERRORS = {};
export const SUBMISSIONS_SUCCESS = {};
export const USERS_ERRORS = {};
export const USERS_SUCCESS = {};
