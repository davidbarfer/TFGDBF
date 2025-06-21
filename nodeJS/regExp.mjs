export async function checkGetSubject(url) {
  const regex = /^\/subject\/\d+$/;
  if (regex.test(url)) {
    const id = url.split('/').pop();
    return id;
  }
  return false;
}

export async function checkPostPracticeCreate(url) {
  const regex = /^\/subject\/\d+\/create$/;
  if (regex.test(url)) {
    const id = url.split('/')[2];
    return id;
  }
  return false;
}