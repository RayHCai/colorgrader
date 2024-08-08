import { BACKEND_URL } from '../settings';

export async function createInferences(assignmentId: string, questions: string[]) {
    return await fetch(`${BACKEND_URL}/inference/`, {
        method: 'POST',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            // eslint-disable-next-line camelcase
            assignment_id: assignmentId,
            questions: questions,
        }),
    });
}
