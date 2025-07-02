export async function getSubject(id: string) {
  const response = await fetch(`http://localhost:1234/subject/${id}`);
  if (!response.ok) {
    const errorText = await response.json();
    throw new Error(`Error ${response.status}: ${errorText.error}`);
  }
  return response.json();
}