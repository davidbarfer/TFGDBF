export const submissionStatuses = {
  pending: 'pendiente',
  pass: 'aprobado',
  fail: 'suspendido',
  late: 'no entregado',
}
export function submissionStatus(grade: number | null, due_date: string | null): string {
  if (grade === null && due_date !== null && new Date(due_date).getTime() < new Date().getTime()) {
    return submissionStatuses.late;
  }
  if (grade !== null && grade >= 5) {
    return submissionStatuses.pass;
  }
  if (grade !== null && grade < 5) {
    return submissionStatuses.fail;
  }
  return submissionStatuses.pending;
}