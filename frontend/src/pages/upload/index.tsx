import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { BACKEND_URL } from '@/settings';
import { createInferences } from '@/helpers/utils';

import Loading from '@/components/loading';
import Button from '@/components/button';

import classes from './styles.module.css';

export default function Upload() {
    const navigate = useNavigate();

    const questions = useRef([] as (HTMLInputElement | null)[]);
    const assignmentName = useRef({} as HTMLInputElement | null);

    const [numQuestions, updateNumQuestions] = useState(0);

    const [assignment, updateAssignment] = useState([]);
    const [isLoading, updateLoadingState] = useState(false);

    if (isLoading) return <Loading />;

    async function upload() {
        const curQuestions = questions.current.map(
            (q) => (q as any).value
        );

        updateLoadingState(true);

        try {
            if (assignment.length === 0)
                throw new Error('Need to upload a JSON file');
            else if (assignment.length > 1)
                throw new Error('Can only upload one file at a time');

            const file: Blob = assignment[0];

            if (file.type.indexOf('json') === -1)
                throw new Error('Type of file must be JSON');

            (async function () {
                const data = new FormData();
                data.append('file', file);

                const res = await fetch(`${BACKEND_URL}/assignments/`, {
                    method: 'POST',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: data,
                });

                if (!res.ok)
                    throw new Error(
                        'An error while creating assignment. Please try again later.'
                    );

                const json = await res.json();

                const inferencesRes = await createInferences(
                    json.data as string,
                    curQuestions
                );

                if (!inferencesRes.ok)
                    throw new Error('Error occurred while creating inferences. Please try again later.');
                else navigate('/');

                updateLoadingState(false);
            })();
        }
        catch (error) {
            alert((error as Error).message);
        }
    }

    return (
        <div className={ classes.container }>
            <h1>Create Assignment</h1>

            <div className={ classes.top }>
                <label className={ classes.fileUploadContainer }>
                    Upload Assignment File
                    
                    <input
                        className={ classes.fileUpload }
                        accept=".json"
                        type="file"
                        onChange={ (e) => updateAssignment(e.target.files as any) }
                    />
                </label>

                <input
                    placeholder="Name"
                    className={ classes.questionInput }
                    ref={ (el) => (assignmentName.current = el) }
                />
            </div>


            <Button
                onClick={ () => updateNumQuestions(numQuestions + 1) }
            >
                Add question
            </Button>

            <>
                { new Array(numQuestions).fill(<input />).map((_, index) => (
                    <input
                        className={ classes.questionInput }
                        key={ index }
                        ref={ (el) => (questions.current[index] = el) }
                    />
                )) }
            </>

            <Button onClick={ upload }>
                Create assignment
            </Button>
        </div>
    );
}
