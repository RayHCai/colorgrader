import json

from assignments.models import Assignments


def answers_from_assignment(assignment_obj: Assignments):
    """
    Read assignment JSON file

    Parameters
        - assignment_obj: Assignment

    Returns:
        - list of dictionaries
            - id
            - student
            - answer
    """

    return json.load(open(assignment_obj.json_file.path))["answers"]
