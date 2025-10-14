export function getSubject(url) {
  const regex = /^\/subject\/\d+$/;
  if (regex.test(url)) {
    const id = url.split('/').pop();
    return id;
  }
  return false;
}

export function getSubjectStudents(url) {
  const regex = /^\/subject\/\d+\/students$/;
  if (regex.test(url)) {
    const id = url.split('/')[2];
    return id;
  }
  return false;
}

export function getSubjectPractices(url) {
  const regex = /^\/subject\/\d+\/practices$/;
  if (regex.test(url)) {
    const id = url.split('/')[2];
    return id;
  }
  return false;
}
export function getPractice(url) {
  const regex = /^\/practice\/\d+$/;
  if (regex.test(url)) {
    const id = url.split('/').pop();
    return id;
  }
  return false;
}

export function getSubjectPracticesGroups(url) {
  const regex = /^\/subject\/\d+\/practice\/\d+\/groups$/;
  if (regex.test(url)) {
    const subject_id = url.split('/')[2];
    const practice_id = url.split('/')[4];
    return { subject_id, practice_id };
  }
  return false;
}

export function getGroup(url) {
  const regex = /^\/group\/\d+$/;
  if (regex.test(url)) {
    const id = url.split('/').pop();
    return id;
  }
  return false;
}

export function getGroupStudents(url) {
  const regex = /^\/group\/\d+\/students$/;
  if (regex.test(url)) {
    const id = url.split('/')[2];
    return id;
  }
  return false;
}

export function getStudentGroups(url) {
  const regex = /^\/student\/\d+\/groups$/;
  if (regex.test(url)) {
    const id = url.split('/')[2];
    return id;
  }
  return false;
}
export function getStudentSubmissions(url) {
  const regex = /^\/student\/\d+\/submissions$/;
  if (regex.test(url)) {
    const id = url.split('/')[2];
    return id;
  }
  return false;
}
export function getStudentPracticeSubmission(url) {
  const regex = /^\/student\/\d+\/practice\/\d+\/submission$/;
  if (regex.test(url)) {
    const student_id = url.split('/')[2];
    const practice_id = url.split('/')[4];
    return { student_id, practice_id };
  }
  return false;
}
