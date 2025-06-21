export async function getSubject(id: string) {
  const response = await fetch(`http://localhost:1234/subject/${id}`);
  if (!response.ok) {
    return null
  }
  return response.json();
}