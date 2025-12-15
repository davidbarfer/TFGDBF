export function postPracticeSubmissionsGrade(url) {
  const regex = /^\/practice\/\d+\/submissions\/grade$/;
  if (regex.test(url)) {
    const practice_id = url.split('/')[2];
    return practice_id;
  }
  return false;
}
export function postStudentSubmissionGrade(url) {
  const regex = /^\/student\/\d+\/submission\/\d+\/grade$/;
  if (regex.test(url)) {
    const student_id = url.split('/')[2];
    const submission_id = url.split('/')[4];
    return { student_id, submission_id };
  }
  return false;
}
