export function postPracticeCreate(url) {
  const regex = /^\/subject\/\d+\/create$/;
  if (regex.test(url)) {
    const id = url.split('/')[2];
    return id;
  }
  return false;
}

export function postPracticeGroupsCreate(url) {
  const regex = /^\/subject\/\d+\/practice\/\d+\/groups\/create$/;
  if (regex.test(url)) {
    const subject_id = url.split('/')[2];
    const practice_id = url.split('/')[4];
    return { subject_id, practice_id };
  }
  return false;
}
