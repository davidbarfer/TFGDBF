export function deleteGroup(url) {
  const regex = /^\/group\/\d+$/;
  if (regex.test(url)) {
    const id = url.split('/').pop();
    return id;
  }
  return false;
}
export function deleteStudentGroup(url) {
  const regex = /^\/group\/\d+\/student\/\d+$/;
  if (regex.test(url)) {
    const group_id = url.split('/')[2];
    const student_id = url.split('/')[4];
    return { group_id, student_id };
  }
  return false;
}
