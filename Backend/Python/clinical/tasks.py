from celery import shared_task
from django.core.management import call_command
from django.utils import timezone

@shared_task
def update_followup_status():
    call_command('update_followup_status')