import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { BACKEND_URL } from '@/settings';
import { createInferences } from '@/helpers/utils';

import { Loading } from '@/components/loading';
import Button from '@/components/button';

import classes from './styles.module.css';

export default function Upload() {
    const navigate = useNavigate();

    const questions = useRef([] as any[]);
    const [numQuestions, updateNumQuestions] = useState(0);

    const [assignment, updateAssignment] = useState([]);
    const [isLoading, updateLoadingState] = useState(false);

    function upload() {
        updateLoadingState(true);

        try {
            if (assignment.length === 0)
                throw new Error('Need to upload a CSV file');
            else if (assignment.length > 1)
                throw new Error('Can only upload one file at a time');

            const forumFile: Blob = assignment[0];

            if (forumFile.type.indexOf('csv') === -1)
                throw new Error('Type of file must be a CSV');

            (async function () {
                const data = new FormData();
                data.append('file', forumFile);

                const res = await fetch(`${BACKEND_URL}/forums/`, {
                    method: 'POST',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: data,
                });

                if (!res.ok)
                    throw new Error(
                        'An error while creating forum. Please try again later.'
                    );

                const json = await res.json();

                const inferencesRes = await createInferences(
                    json.data as string,
                    questions.current.map(
                        (q) => (q as any).value
                    )
                );

                if (!inferencesRes.ok)
                    throw new Error('Error occurred while creating inferences. Please try again later.');
                else navigate('/');
            })();
        }
        catch (error) {
            alert((error as Error).message);
        }
        finally {
            updateLoadingState(false);
        }
    }

    if (isLoading) return <Loading />;

    return (
        <div className={ classes.container }>
            <label className={ classes.fileUploadContainer }>
                Upload CSV
                
                <input
                    className={ classes.fileUpload }
                    type="file"
                    onChange={ (e) => updateAssignment(e.target.files as any) }
                />
            </label>

            <Button
                onClick={ () => updateNumQuestions(numQuestions + 1) }
            >
                Add question
            </Button>

            <div>
                { new Array(numQuestions).fill(<input />).map((_, index) => (
                    <input
                        className={ classes.questionInput }
                        key={ index }
                        ref={ (el) => (questions.current[index] = el) }
                    />
                )) }
            </div>

            <Button onClick={ upload }>
                Create assignment
            </Button>
        </div>
    );
}
