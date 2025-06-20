export async function getSubject(id: string) {
  const response = await fetch(`http://localhost:1234/subject/${id}`);
  return response.json();
}