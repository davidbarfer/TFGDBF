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
export async function addStudentToGroup(token: string, group_id: string, student_id: string) {
  const response = await fetch(`${API_URL}/group/${group_id}/student/${student_id}`,
      {
          method: 'POST',
          headers: {
              'Authorization': token,
          },
          body: JSON.stringify({
            group_id: group_id,
            student_id: student_id
          }),
      }
  );
  if(!response.ok) {
      const errorText = await response.json();
      throw new Error(`Error ${response.status}: ${errorText.error}`);
  }
  return response.json();
}
export async function getGroup(token: string, group_id: string) {
  const response = await fetch(`${API_URL}/group/${group_id}`,
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
export async function getGroupStudents(token: string, group_id: string) {
  const response = await fetch(`${API_URL}/group/${group_id}/students`,
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
export async function getStudentSubmissions(token: string, user_id: string) {
    const response = await fetch(`${API_URL}/student/${user_id}/submissions`, 
        {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        }
    );
    // if(!response.ok) {
    //     const errorText = await response.json();
    //     throw new Error(`Error ${response.status}: ${errorText.error}`);
    // }
    return response.json();
}
export async function getStudentPracticeSubmission(token: string, student_id: string, practice_id: string) {
    const response = await fetch(`${API_URL}/student/${student_id}/practice/${practice_id}/submission`, 
        {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        }
    );
    if(!response.ok) {
        return null;
    //     const errorText = await response.json();
    //     throw new Error(`Error ${response.status}: ${errorText.error}`);
    }
    return response.json();
}
export async function getSubmissionFile(token: string, student_id: string, submission_id: string) {
    const response = await fetch(`${API_URL}/student/${student_id}/submission/${submission_id}/file`, 
        {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        }
    );
    if(!response.ok) {
        return null;
    //     const errorText = await response.json();
    //     throw new Error(`Error ${response.status}: ${errorText.error}`);
    }
    return response.json();
}