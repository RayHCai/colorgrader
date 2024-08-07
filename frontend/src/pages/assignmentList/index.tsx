import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import Loading from '@/components/loading';
import Button from '@/components/button';

import { BACKEND_URL } from '@/settings';

import classes from './styles.module.css';

export default function AssignmentList() {
    const navigate = useNavigate();

    const [assignments, updateAssignments] = useState([] as any[]);

    const [isLoading, updateLoadingState] = useState(false);

    useEffect(() => {
        updateLoadingState(true);

        (async function () {
            try {
                const res = await fetch(`${BACKEND_URL}/forums/`);

                if (!res.ok)
                    throw new Error(
                        'An error occurred while fetching forums. Please try again later.'
                    );

                const json = await res.json();

                updateAssignments(json.data);
            }
            catch (error) {
                alert((error as Error).message);
            }
            finally {
                updateLoadingState(false);
            }
        })();
    }, []);

    if (isLoading) return <Loading />;

    return (
        <div className={ classes.container }>
            <h1>Uploaded Assignments</h1>

            { assignments.length > 0 ? (
                assignments.map((assignment, index) => (
                    <Button
                        key={ index }
                        onClick={ () => navigate(`assignment/?forumId=${assignment.id}`) }
                    >
                        { assignment.name }
                    </Button>
                ))
            ) : (
                <p>
                    No assignments found. Go <Link to="/upload" className={ classes.uploadLink }>here</Link> to
                    add one.
                </p>
            ) }
        </div>
    );
}
