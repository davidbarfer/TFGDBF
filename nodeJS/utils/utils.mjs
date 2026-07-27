export function add7days(date) {
  const dateObject = new Date(date);
  dateObject.setDate(dateObject.getDate() + 7);
  return dateObject.toISOString().split('T')[0];
}

export function parseDateMatlab(date) {
  const dateObject = new Date(date);
  return dateObject.toISOString().replace(/[-:.]/g, '_');
}
export const roles = {
  admin: 'admin',
  professor: 'professor',
  student: 'student',
};
