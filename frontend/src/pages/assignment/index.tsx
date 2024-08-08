import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import Loading from '@/components/loading';
import Button from '@/components/button';

import { BACKEND_URL, COLORS } from '@/settings';

import classes from './styles.module.css';

export default function Assignment() {
    const [searchParams, _] = useSearchParams();

    const grades = useRef<(HTMLInputElement[] | null)[]>([]);

    const [isLoading, updateLoadingState] = useState(false);

    const [assignmentName, updateAssignmentName] = useState('');
    const [answers, updateAnswers] = useState<Answer[]>([]);
    const [inferences, updateInferences] = useState<Inference | null>(null);

    const [curPage, updateCurPage] = useState(0);

    useEffect(() => {
        updateLoadingState(true);

        (async function () {
            try {
                const assignmentRes = await fetch(
                    `${BACKEND_URL}/assignments/?assignment_id=${searchParams.get(
                        'id'
                    )}`
                );

                if (!assignmentRes.ok)
                    throw new Error('Error occurred while fetching answers');

                const assignmentJSON = await assignmentRes.json();

                const inferenceRes = await fetch(
                    `${BACKEND_URL}/inference/?assignment_id=${searchParams.get(
                        'id'
                    )}`
                );

                if (!inferenceRes.ok)
                    throw new Error(
                        'Error occurred while fetching inferences for answers'
                    );

                const inferencesJson = await inferenceRes.json();

                updateAssignmentName(assignmentJSON.data.name);
                updateAnswers(assignmentJSON.data.answers);
                updateInferences(inferencesJson.data);
            }
            catch (error) {
                alert((error as Error).message);
            }
            finally {
                updateLoadingState(false);
            }
        })();
    }, []);

    function finalizeGrades() {
        const jsonGrades = JSON.stringify(
            answers.map(a => {
                const gradeRef = grades.current[Number(a.id)];

                return {
                    [a.id]: (
                        !gradeRef ? null : (
                            gradeRef.map((i: HTMLInputElement) => Number(i.value))
                        )
                    ),
                };
            })
        );

        const a = window.document.createElement('a');

        a.href = window.URL.createObjectURL(
            new Blob([jsonGrades], { type: 'application/json' })
        );
        a.download = `${assignmentName}-grades.json`;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
    }

    if(isLoading || answers.length === 0) return <Loading />;

    return (
        <div className={ classes.container }>
            <h1>{ assignmentName }</h1>

            <div className={ classes.buttonContainer }>
                <Button
                    onClick={ finalizeGrades }
                >
                    Download Grades
                </Button>
            </div>

            {
                inferences && (
                    inferences.questions.map((q: string, index: number) => (
                      <h4
                          style={ { color: COLORS[index] } }
                          key={ index }
                      >
                          { q }
                      </h4>
                    ))
                )
            }

            <div className={ classes.answerContainer }>
                <IoIosArrowBack
                    className={ `${classes.arrow} ${curPage <= 0 ? classes.disabled : ''}` }
                    onClick={
                        () => {
                            if(curPage > 0)
                                updateCurPage(curPage - 1)
                        }
                    }
                />

                {
                    (function() {
                        const answer = answers[curPage];

                        const answerSpans = [];

                        const answerInferences = inferences!.inferences[answer.id];

                        const colors = new Array<string>(answer.answer.length).fill(
                            'white'
                        );

                        for (let i = 0; i < answerInferences.length; i++) {
                            const ans = answerInferences[i];
                            const startInd = ans.start_ind;
                            const endInd = ans.end_ind;

                            for (let j = startInd; j <= endInd; j++) {
                                colors[j] = COLORS[i];
                            }
                        }

                        for (let i = 0; i < answer.answer.length; i++) {
                            const c = answer.answer[i];

                            answerSpans.push(
                                <span
                                    key={ i }
                                    style={ {
                                        color: colors[i],
                                    } }
                                >
                                    { c }
                                </span>
                            );
                        }

                        return (
                            <div className={ classes.answerContentContainer }>
                                <div className={ classes.answerContent }>
                                    <h2>{ answer.student }</h2>

                                    { answerSpans.map((span: any) => span) }
                                </div>

                                <div className={ classes.scoreContainer }>
                                    { inferences!.questions.map((q: any, i: any) => (
                                        <input
                                            type="number"
                                            className={ classes.scoreInput }
                                            key={ i }
                                            placeholder={ `Grade for "${q}"` }
                                            ref={ (el) => {
                                                if (!grades.current[Number(answer.id)])
                                                    grades.current[Number(answer.id)] =
                                                        new Array<HTMLInputElement>(
                                                            inferences!.questions.length
                                                        );

                                                grades.current[Number(answer.id)]![i] = el!;
                                            } }
                                        />
                                    )) }
                                </div>
                            </div>
                        );
                    })()
                }

                <IoIosArrowForward
                    className={ `${classes.arrow} ${curPage > answers.length - 2 ? classes.disabled : ''}` }
                    onClick={
                        () => {
                            if(curPage < answers.length - 1)
                                updateCurPage(curPage + 1)
                        }
                    }
                />
            </div>
        </div>
    );
}
