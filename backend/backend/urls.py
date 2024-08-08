from django.contrib import admin
from django.urls import path

from assignments.views import AssignmentsView, AssignmentAnswersView
from inferences.views import (
    InferencesView,
    AnswerRelationsView,
    DeleteInferencesView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("assignments/", AssignmentsView.as_view()),
    path("answers/", AssignmentAnswersView.as_view()),
    path("inference/", InferencesView.as_view()),
    path("answerrelations/", AnswerRelationsView.as_view()),
    path("deleteinferences/", DeleteInferencesView.as_view()),
]
