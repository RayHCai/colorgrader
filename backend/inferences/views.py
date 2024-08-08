import json
import os

from rest_framework.views import APIView
from rest_framework.response import Response

from backend.utils import answers_from_assignment
from backend.settings import (
    INFERENCES_FILE_LOCATION,
    NUM_CORES,
    QA_MODEL_NAME,
    SENT_MODEL_NAME,
)

from assignments.models import Assignments

from inferences.models import Inferences
from inferences.forms import AnswerRelationsForm

from transformers import pipeline
from sentence_transformers import SentenceTransformer, util


def cosine_similarity(vec1, vec2):
    """
    Calculate cosine similarity between two sentence embeddings

    Args:
        vec1: Embedding of first sentence
        vec2: Embedding of second sentence

    Returns:
        Similarity between two sentence vectors (float)
    """

    return util.pytorch_cos_sim(vec1, vec2).tolist()[0][0]


def make_inferences(qa_model, sent_model, question, context):
    """
    Make inferences for a question given a context

    Args:
        qa_model: pipeline
        sent_model: SentenceTransformer
        question: string
        context: string

    Returns:
        Object with results for inferences
            - answer: answer to given question
            - start_ind: start index of the answer
            - end_ind: end index of the answer
            - answer_embedding: list version of embedding for the answer
    """

    # qa model requires question and context
    qa_model_input = {"question": question, "context": context}

    qa_result = qa_model(qa_model_input, num_workers=NUM_CORES - 1)

    # create an embedding for the answer
    answer_embedding = sent_model.encode(qa_result["answer"])

    return {
        "answer": qa_result["answer"],
        "start_ind": qa_result["start"],
        "end_ind": qa_result["end"],
        "answer_embedding": answer_embedding.tolist(),
    }


class InferencesView(APIView):
    def get(self, request):
        """
        Get inference files

        Request parameters
            - assignment_id -> id of assignment to get inferences for
        """

        assignment_id = request.GET.get("assignment_id")

        if not assignment_id:
            return Response({"message": "Invalid response data"}, status=400)

        try:
            assignment = Assignments.objects.get(id=assignment_id)
        except Assignments.DoesNotExist:
            return Response({"message": "Assignment does not exist"}, status=404)

        # if there are no inferences for assignment object
        if not (inferences := Inferences.objects.filter(assignment=assignment).first()):
            return Response(
                {"message": "No inferences exist for assignment"}, status=404
            )

        with open(
            INFERENCES_FILE_LOCATION + inferences.inferences.name
        ) as inference_file:
            inference_dict = json.loads(inference_file.read())

            return Response(
                {"message": "Successfuly retrieved inferences", "data": inference_dict},
                status=200,
            )

    def post(self, request):
        """
        Create inferences for assignment

        Request body
            - assignment_id -> id of the assignment to make inferences on
            - questions -> list of questions
        """

        assignment_id = request.data.get("assignment_id")
        questions = request.data.get("questions")

        if not assignment_id or not questions:
            return Response({"message": "Invalid request data"}, status=400)

        try:
            assignment = Assignments.objects.get(id=assignment_id)
        except Assignments.DoesNotExist:
            return Response({"message": "Assignment does not exist"}, status=404)

        if Inferences.objects.filter(assignment=assignment).exists():
            return Response(
                {"message": "An inference already exists for this assignment"},
                status=400,
            )

        answers = answers_from_assignment(assignment)

        # Make Inferences
        qa_model = pipeline(
            "question-answering", model=QA_MODEL_NAME, tokenizer=QA_MODEL_NAME
        )

        sent_model = SentenceTransformer(SENT_MODEL_NAME)

        inferences = {}

        for answer in answers:
            answer_inferences = []

            for question in questions:  # then each question
                answer_inferences.append(
                    make_inferences(qa_model, sent_model, question, answer['answer'])
                )

            inferences[answer['id']] = answer_inferences

        full_data = {"questions": questions, "inferences": inferences}

        assignment_file_name = assignment.get_file_name()

        inference_file_name = f"{assignment_file_name}_inferences.json"
        inference_file_location = INFERENCES_FILE_LOCATION + inference_file_name

        open(inference_file_location, "x")  # create inference file

        with open(inference_file_location, "w") as inference:
            inference.write(json.dumps(full_data))

        Inferences.objects.create(assignment=assignment, inferences=inference_file_name)

        return Response(
            {"message": "Successfuly made inferences", "data": full_data}, status=200
        )


class AnswerRelationsView(APIView):
    def post(self, request):
        """
        Make a list of answers with cosine similarity greater than user input (for a given quesiton)

        Request body
            - question -> question to filter by
            - assignment_id -> id for assignment to be used
            - answer_id -> id for answer to be used as a baseline
            - similarity -> the cosine similarity baseline for similar answers
        """

        answer_relations_form = AnswerRelationsForm(request.data)

        if not answer_relations_form.is_valid():
            return Response({"message": "Invalid request data"}, status=400)

        try:
            assignment_id = answer_relations_form.cleaned_data.get("assignment_id")

            assignment = Assignments.objects.get(id=assignment_id)
        except Assignments.DoesNotExist:
            return Response({"message": "Assignment does not exist"}, status=404)

        try:
            inferences_obj = Inferences.objects.get(assignment=assignment)
        except Inferences.DoesNotExist:
            return Response(
                {"message": "Inferences do not exist for assignment"}, status=404
            )

        inferences = {}

        with open(
            INFERENCES_FILE_LOCATION + inferences_obj.inferences.name
        ) as inference_file:
            inferences = json.loads(inference_file.read())

        question = answer_relations_form.cleaned_data.get("question")
        inferenced_questions = inferences.get("questions")
        inferences_dict = inferences.get("inferences")

        # if no inferences were made for given question
        if not question in inferenced_questions:
            return Response(
                {"message": "No inferences were made for question"}, status=404
            )

        filtered_inferences = {}

        question_ind = inferenced_questions.index(question)

        answer_id = str(answer_relations_form.cleaned_data.get("answer_id"))

        if not (base_inference := inferences_dict.get(answer_id)):
            return Response(
                {"message": "Answer with ID does not exist in assignment"}, status=404
            )

        base_answer = base_inference[question_ind]

        base_similarity = answer_relations_form.cleaned_data.get("similarity")

        for answer_id, answers in inferences_dict.items():
            answer_embedding = answers[question_ind].get("answer_embedding")

            answers_cosine_similarity = cosine_similarity(
                base_answer.get("answer_embedding"), answer_embedding
            )

            if answers_cosine_similarity > base_similarity:
                filtered_inferences[answer_id] = {
                    "answer_id": answer_id,
                    "similarity": answers_cosine_similarity,
                }

        return Response(
            {"message": "Successfuly grouped answer", "data": filtered_inferences},
            status=200,
        )


# class QuestionInferenceView(APIView):
#     def post(self, request):
#         '''
#         Create inferences for a single question

#         Request parameters:
#             assignment_id -> id of assignment
#             question -> question to make inferences for
#             answer_ids -> list of answer_ids to get answer for
#         '''

#         assignment_id = request.data.get('assignment_id')
#         question = request.data.get('question')
#         answer_ids = request.data.get('answer_ids')

#         if not assignment_id or not question or not answer_ids:
#             return Response({'message': 'Invalid request data'}, status=400)

#         try:
#             assignment = Assignments.objects.get(id=assignment_id)
#         except Assignments.DoesNotExist:
#             return Response({'message': 'Assignment does not exist'}, status=404)

#         answers = answers_from_assignment(assignment)

#         # Make inferences

#         qa_model = pipeline(
#             'question-answering',
#             model=QA_MODEL_NAME,
#             tokenizer=QA_MODEL_NAME
#         )

#         sent_model = SentenceTransformer(SENT_MODEL_NAME)

#         inferences = {}

#         for post in posts: # iterate through each post
#             inferences[post.id] = make_inferences(
#                 qa_model,
#                 sent_model,
#                 question,
#                 post.message
#             )

#         full_data = {
#             'question': question,
#             'inferences': inferences
#         }

#         return Response(
#             {
#                 'message': 'Successfuly made inferences',
#                 'data': full_data
#             },
#             status=200
#         )


class DeleteInferencesView(APIView):
    def post(self, request):
        """
        Delete inference file

        Request parameters:
            assignment_id: id of assignment
        """

        assignment_id = request.data.get("assignment_id")

        if not assignment_id:
            return Response({"message": "Invalid request data"}, status=400)

        try:
            assignment = Assignments.objects.get(id=assignment_id)
            inferences = Inferences.objects.get(assignment=assignment)

            os.remove(INFERENCES_FILE_LOCATION + inferences.inferences.name)

            inferences.delete()

            return Response({"message": "Succesfuly deleted inferences"}, status=200)
        except Assignments.DoesNotExist:
            return Response({"message": "Assignment does not exist"}, status=404)
        except Inferences.DoesNotExist:
            return Response(
                {"message": "Inferences do not exist for assignment"}, status=404
            )
