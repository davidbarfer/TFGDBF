export async function getSubjects(token: string) {

    const response = await fetch('http://localhost:1234/professor/subjects',
        {
            headers: {
                'Authorization': token,
            },
        }
    );
    return response.json();
}
export async function getPractices(token: string, subject_id: string) {
    const response = await fetch('http://localhost:1234/subject/' + subject_id + '/practices',
        {
            headers: {
                'Authorization': token,
            },
        }
    );
    return response.json();
}
export async function getGroups(token: string, subject_id: string, practice_id: string) {
    const response = await fetch('http://localhost:1234/subject/' + subject_id + '/practice/' + practice_id + '/groups',
        {
            headers: {
                'Authorization': token,
            },
        }
    );
    return response.json();
}
export async function getGroup(token: string, group_id: string) {
    const response = await fetch('http://localhost:1234/group/' + group_id,
        {
            headers: {
                'Authorization': token,
            },
        }
    );
    return response.json();
}
export async function deleteGroup(token: string, group_id: string) {
    const response = await fetch('http://localhost:1234/group/' + group_id,
        {
            method: 'DELETE',
            headers: {
                'Authorization': token,
            },
        }
    );
    return response.json();
}
export async function createPractice(token:string, subject_id:string, practice_data: { name: string, description: string, deadline: string}) {
    const response = await fetch('http://localhost:1234/subject/' + subject_id + '/create',
        {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(practice_data),
        }
    );
    return response.json();
}
export async function createGroups(token:string, subject_id:string, group_data: {practice_id:string, group_name: string, max_participants: number, group_date: string, start_time: string, end_time: string}) {
    const response = await fetch('http://localhost:1234/subject/' + subject_id + '/practice/' + group_data.practice_id + '/groups/create',
        {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(group_data),
        }
    );
    return response.json();
}