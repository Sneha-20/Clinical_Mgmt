from django.core.management.base import BaseCommand
from django.utils import timezone
from clinical.models import Trial


class Command(BaseCommand):
    help = 'Update visit status to "Follow-up" on follow-up date'

    def handle(self, *args, **options):
        today = timezone.now().date()
        
        # 1. Update trials that END today to "Decision Pending"
        trials_ending_today = Trial.objects.filter(
            trial_end_date=today,
            visit__status='Trial Active'
        )
        
        for trial in trials_ending_today:
            trial.visit.status = 'Follow up'
            trial.visit.status_note = 'Trial ended, Follow up needed'
            trial.visit.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Trial ended for patient {trial.assigned_patient.name} - Status: Decision Pending'
                )
            )
        
        # 2. Update follow-up dates to "Follow-up"
        trials_followup_today = Trial.objects.filter(
            followup_date=today,
            visit__status='Decision Pending'
        )
        
        for trial in trials_followup_today:
            trial.visit.status = 'Follow up'
            trial.visit.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Follow-up needed for patient {trial.assigned_patient.name} - Status: Follow-up'
                )
            )
        
        total_updated = trials_ending_today.count() + trials_followup_today.count()
        
        if total_updated == 0:
            self.stdout.write(self.style.WARNING('No status updates needed today'))
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Total updates: {total_updated} visits')
            )
