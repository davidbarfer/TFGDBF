export function add7days(date) {
  const dateObject = new Date(date);
  dateObject.setDate(dateObject.getDate() + 7);
  return dateObject.toISOString().split('T')[0];
}
