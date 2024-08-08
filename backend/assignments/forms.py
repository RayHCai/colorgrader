from django import forms


class AssignmentAnswersForm(forms.Form):
    answer_id = forms.UUIDField()
    assignment_id = forms.UUIDField()
