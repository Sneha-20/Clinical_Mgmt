"""
Django management command to populate TestType table with standard test types.

Usage:
    python manage.py populate_test_types
    
    # Create test types for a specific clinic
        python manage.py populate_test_types --clinic-id 1

    # Update existing test types (if you change costs in the script)
        python manage.py populate_test_types --update


This will create TestType records for all standard hearing tests with default costs.
You can adjust the costs later via Django admin or by editing this script.
"""

from django.core.management.base import BaseCommand
from clinical.models import TestType, Clinic


class Command(BaseCommand):
    help = 'Populate TestType table with standard hearing test types and costs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clinic-id',
            type=int,
            help='Optional: Clinic ID to associate test types with. If not provided, test types will be global (clinic=None)',
        )
        parser.add_argument(
            '--update',
            action='store_true',
            help='Update existing test types if they already exist',
        )

    def handle(self, *args, **options):
        clinic_id = options.get('clinic_id')
        update = options.get('update', False)

        clinic = None
        if clinic_id:
            try:
                clinic = Clinic.objects.get(id=clinic_id)
                self.stdout.write(self.style.SUCCESS(f'Associating test types with clinic: {clinic.name}'))
            except Clinic.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Clinic with ID {clinic_id} not found. Creating global test types.'))

        # Standard test types with example costs (adjust as needed)
        test_types_data = [
            {
                'name': 'PTA',
                'code': 'PTA',
                'cost': 500.00,
                'description': 'Pure Tone Audiometry - Measures hearing sensitivity at different frequencies',
            },
            {
                'name': 'Immittance',
                'code': 'IMP',
                'cost': 400.00,
                'description': 'Immittance Testing - Evaluates middle ear function and eardrum mobility',
            },
            {
                'name': 'OAE',
                'code': 'OAE',
                'cost': 600.00,
                'description': 'Otoacoustic Emissions - Tests inner ear (cochlea) function',
            },
            {
                'name': 'BERA/ASSR',
                'code': 'BERA',
                'cost': 1500.00,
                'description': 'Brainstem Evoked Response Audiometry / Auditory Steady State Response - Objective hearing assessment',
            },
            {
                'name': 'SRT',
                'code': 'SRT',
                'cost': 300.00,
                'description': 'Speech Reception Threshold - Minimum level at which speech is understood',
            },
            {
                'name': 'SDS',
                'code': 'SDS',
                'cost': 300.00,
                'description': 'Speech Discrimination Score - Ability to understand speech at comfortable listening levels',
            },
            {
                'name': 'UCL',
                'code': 'UCL',
                'cost': 300.00,
                'description': 'Uncomfortable Loudness Level - Maximum comfortable listening level',
            },
            {
                'name': 'Free Field',
                'code': 'FF',
                'cost': 400.00,
                'description': 'Free Field Testing - Hearing assessment in an open sound field',
            },
        ]

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for test_data in test_types_data:
            test_type, created = TestType.objects.get_or_create(
                name=test_data['name'],
                defaults={
                    'clinic': clinic,
                    'code': test_data['code'],
                    'cost': test_data['cost'],
                    'description': test_data['description'],
                    'is_active': True,
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Created: {test_type.name} - ₹{test_type.cost}'
                    )
                )
            else:
                if update:
                    # Update existing test type
                    test_type.clinic = clinic
                    test_type.code = test_data['code']
                    test_type.cost = test_data['cost']
                    test_type.description = test_data['description']
                    test_type.is_active = True
                    test_type.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(
                            f'↻ Updated: {test_type.name} - ₹{test_type.cost}'
                        )
                    )
                else:
                    skipped_count += 1
                    self.stdout.write(
                        self.style.NOTICE(
                            f'⊘ Skipped (already exists): {test_type.name} - ₹{test_type.cost}'
                        )
                    )

        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(f'  Created: {created_count}')
        if update:
            self.stdout.write(f'  Updated: {updated_count}')
        if not update:
            self.stdout.write(f'  Skipped (already exists): {skipped_count}')
        self.stdout.write('=' * 60)

