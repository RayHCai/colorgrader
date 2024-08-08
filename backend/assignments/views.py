from rest_framework.views import APIView
from rest_framework.response import Response

from backend.utils import answers_from_assignment

from assignments.models import Assignments
from assignments.forms import AssignmentAnswersForm


class AssignmentsView(APIView):
    def get(self, request):
        """
        Get object from ID or get all objects

        Request parameters
            - assignment_id (optional) -> id object to retrieve
        """

        assignment_id = request.GET.get("assignment_id")

        if not assignment_id:
            serialized = []

            for assignment in Assignments.objects.all():
                serialized.append(
                    {"id": str(assignment.id), "name": assignment.get_file_name()}
                )

            return Response({"data": serialized}, status=200)
        else:
            try:
                assignment = Assignments.objects.get(id=assignment_id)

                serialized = {
                    "id": str(assignment.id),
                    "name": assignment.get_file_name(),
                    "answers": answers_from_assignment(assignment),
                }

                return Response({"message": "Success", "data": serialized}, status=200)
            except Assignments.DoesNotExist:
                return Response({"message": "Assignment does not exist"}, status=404)

    def post(self, request):
        """
        Create object from JSON file

        Request data
            - file -> JSON file
        """

        json_file = request.data.get("file")

        if not json_file:
            return Response({"message": "Invalid request data"}, status=400)

        assignment = Assignments.objects.create(json_file=json_file)

        return Response(
            {"message": "Successfuly created assignment", "data": str(assignment.id)},
            status=200,
        )


class AssignmentAnswersView(APIView):
    def get(self, request):
        """
        Get specific answer information from answer id and assignment id

        Request parameters
            - answer_id -> ID of answer
            - assignment_id -> ID of assignment
        """

        answers_form = AssignmentAnswersForm(request.GET)

        if not answers_form.is_valid():
            return Response({"message": "Invalid request data"}, status=400)

        try:
            assignment_id = answers_form.cleaned_data.get("assignment_id")

            assignment = Assignments.objects.get(id=assignment_id)
        except Assignments.DoesNotExist:
            return Response({"message": "Assignment does not exist"}, status=404)

        return Response(
            {"message": "Success", "data": answers_from_assignment(assignment)},
            status=200,
        )
