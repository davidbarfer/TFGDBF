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
  usersNotFound: 'No se encontraron usuarios en el grupo',
  groupNotAffected: 'No se ha afectado al grupo',
  groupNotFoundInPractice: 'Grupo no encontrado en la práctica',
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
  subjectNotAffected: 'No se ha afectado a la asignatura',
};
export const SUBJECTS_SUCCESS = {
  subjectDeleted: 'Asignatura eliminada con éxito',
  subjectAssigned: 'Asignatura asignada con éxito',
  subjectUnassigned: 'Asignatura desasignada con éxito',
};
export const SUBMISSIONS_ERRORS = {
  submissionNotFound: 'Entrega no encontrado',
  userSubmissionNotFound: 'Entrega no encontrada para el usuario',
  submissionFileNotFound: 'Archivo de entrega no encontrado',
  submissionDataRequired: 'Se requiere datos de entrega válidos',
  submissionFileRequired: 'Se requiere archivo de entrega válido',
  submissionFileMaxSizeExceeded:
    'El tamaño del archivo de entrega excede el máximo permitido de 1MB',
  submissionSintaxError: 'Error de sintaxis en la entrega',
  submissionNotCreatedForUser: 'Entrega no creada para el usuario',
  submissionNotAffected: 'No se ha afectado a la entrega',
};
export const SUBMISSIONS_SUCCESS = {
  submissionSaved: 'Entrega guardada con éxito',
  submissionUpdated: 'Entrega actualizada con éxito',
};
export const USERS_ERRORS = {};
export const USERS_SUCCESS = {};
