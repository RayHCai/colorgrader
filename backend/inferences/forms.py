from django import forms


class AnswerRelationsForm(forms.Form):
    assignment_id = forms.UUIDField()
    answer_id = forms.IntegerField()

    question = forms.CharField()
    similarity = forms.FloatField()
