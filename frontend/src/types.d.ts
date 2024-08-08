declare module '*.css';

declare interface Assignment {
    id: string;
    name: string;
    answers: Answer[];
}

declare interface Answer {
    id: string;
    student: string;
    answer: string;
}

declare interface Inference {
    questions: string[];
    inferences: {
        [key: string]: AnswerInference[];
    };
}

declare interface AnswerInference {
    answer: string;
    start_ind: number;
    end_ind: number;
    answer_embedding: number[];
}
