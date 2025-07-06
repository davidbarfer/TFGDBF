import { API_URL } from "@/utils/enviroment";
export async function getSubject(id: string, token: string) {
  const response = await fetch(`${API_URL}/subject/${id}`,
    {
      headers: {
        'Authorization': token,
      }
    }
  );
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
export async function getPractices(token: string, subject_id: string) {
  const response = await fetch(`${API_URL}/subject/${subject_id}/practices`,
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
export async function getPractice(token: string, practice_id: string) {
  const response = await fetch(`${API_URL}/practice/${practice_id}`,
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
export async function getGroups(token: string, subject_id: string, practice_id: string) {
  const response = await fetch(`${API_URL}/subject/${subject_id}/practice/${practice_id}/groups`,
      {
          headers: {
              'Authorization': token,
          },
      }
  );
  return response.json();
}
export async function getStudentGroups(token: string, user_id: string) {
  const response = await fetch(`${API_URL}/student/${user_id}/groups`,
      {
          headers: {
              'Authorization': token,
          },
      }
  );
  if(response.status === 404) {
    return [];
  }
  if(!response.ok) {
      const errorText = await response.json();
      throw new Error(`Error ${response.status}: ${errorText.error}`);
  }
  return response.json();
}