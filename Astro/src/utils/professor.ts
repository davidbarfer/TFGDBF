import { API_URL } from "@/utils/enviroment";
export async function getSubjectsStudents(token: string, subject_id: string) {
    const response = await fetch(`${API_URL}/subject/${subject_id}/students`,
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
export async function deleteStudentGroup(token: string, group_id: string, student_id: string) {
    const response = await fetch(`${API_URL}/group/${group_id}/student/${student_id}`,
        {
            method: 'DELETE',
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
export async function deleteGroup(token: string, group_id: string) {
    const response = await fetch(`${API_URL}/group/${group_id}`,
        {
            method: 'DELETE',
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
export async function createPractice(token:string, subject_id:string, practice_data: { name: string, description: string, deadline: string}) {
    const response = await fetch(`${API_URL}/subject/${subject_id}/create`,
        {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(practice_data),
        }
    );
    if(!response.ok) {
        const errorText = await response.json();
        throw new Error(`Error ${response.status}: ${errorText.error}`);
    }
    return response.json();
}
export async function createGroups(token:string, subject_id:string, group_data: {practice_id:string, group_name: string, max_participants: number, group_date: string, start_time: string, end_time: string}) {
    const response = await fetch(`${API_URL}/subject/${subject_id}/practice/${group_data.practice_id}/groups/create`,
        {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(group_data),
        }
    );
    if(!response.ok) {
        const errorText = await response.json();
        throw new Error(`Error ${response.status}: ${errorText.error}`);
    }
    return response.json();
}