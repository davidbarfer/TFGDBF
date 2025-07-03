import { API_URL } from "@/utils/enviroment";
export async function getSubject(id: string) {
  const response = await fetch(`${API_URL}/subject/${id}`);
  if (!response.ok) {
    const errorText = await response.json();
    throw new Error(`Error ${response.status}: ${errorText.error}`);
  }
  return response.json();
}
export async function getSubjects(token: string) {

  const response = await fetch(`${API_URL}/subjects`,
      {
          headers: {
              'Authorization': token,
          },
      }
  );
  if(!response.ok) {
      const errorText = await response.json();
      throw new Error(`Error ${response.status}: ${errorText.error}`);
  }
  return response.json();
}