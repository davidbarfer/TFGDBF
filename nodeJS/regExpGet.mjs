export async function checkGetSubject(url) {
  const regex = /^\/subject\/\d+$/;
  if (regex.test(url)) {
    const id = url.split('/').pop();
    return id;
  }
  return false;
}

export async function checkGetSubjectPractices(url) {
  const regex = /^\/subject\/\d+\/practices$/;
  if (regex.test(url)) {
    const id = url.split('/')[2];
    return id;
  }
  return false;
}

export async function checkGetSubjectPracticesGroups(url) {
  const regex = /^\/subject\/\d+\/practice\/\d+\/groups$/;
  if (regex.test(url)) {
    const subject_id = url.split('/')[2];
    const practice_id = url.split('/')[4];
    return { subject_id, practice_id };
  }
  return false;
}

export async function  checkGetGroup(url) {
  const regex = /^\/group\/\d+$/;
  if (regex.test(url)) {
    const id = url.split('/').pop();
    return id;
  }
  return false;
}