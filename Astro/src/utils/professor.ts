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