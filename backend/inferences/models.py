import uuid

from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from backend.settings import INFERENCES_FILE_LOCATION

from assignments.models import Assignments


class Inferences(models.Model):
    """
    Stores answer inferences.

    Fields
        - id
        - assignment*
        - inferences*
        - date_created
    """

    id = models.UUIDField(
        primary_key=True, unique=True, blank=False, default=uuid.uuid4, editable=False
    )

    assignment = models.ForeignKey(Assignments, on_delete=models.CASCADE)

    inferences = models.FileField(blank=False, upload_to=INFERENCES_FILE_LOCATION)

    date_created = models.DateTimeField(auto_now_add=True, editable=False)

    def __str__(self):
        return f"Inferences for { self.assignment.get_file_name() }"


@receiver(pre_delete, sender=Inferences)
def pre_delete_inference(sender, instance, **kwargs):
    """
    Delete inference JSON file when inference object is deleted
    """

    instance.inferences.storage.delete(instance.inferences.name)
