import uuid

from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from backend.settings import ASSIGNMENT_FILE_LOCATION


class Assignments(models.Model):
    """
    Stores JSON file for assignment and other related information

    Fields
        - id
        - json_file*
        - date_created
    """

    id = models.UUIDField(
        primary_key=True, unique=True, blank=False, default=uuid.uuid4, editable=False
    )

    json_file = models.FileField(blank=False, upload_to=ASSIGNMENT_FILE_LOCATION)

    date_created = models.DateTimeField(auto_now_add=True, editable=False)

    def get_file_name(self):
        """
        Get the name of the JSON file
        """

        full_file = self.json_file.name.split("/")[-1]

        return full_file.replace(".json", "")

    def __str__(self):
        return f"{self.id} saved at {self.json_file.name}"


@receiver(pre_delete, sender=Assignments)
def pre_delete_assignment_file(sender, instance, **kwargs):
    """
    Delete JSON file when object is deleted
    """

    instance.json_file.storage.delete(instance.json_file.name)
