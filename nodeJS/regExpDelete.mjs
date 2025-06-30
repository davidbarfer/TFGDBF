export async function checkDeleteGroup(url) {
  const regex = /^\/group\/\d+$/;
  if (regex.test(url)) {
    const id = url.split('/').pop();
    return id;
  }
  return false;
}