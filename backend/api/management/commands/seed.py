from django.core.management.base import BaseCommand
from api.models import User, FormTemplate

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
        # Create Consultant
        if not User.objects.filter(username='consultant').exists():
            User.objects.create_superuser(
                username='consultant',
                email='consultant@example.com',
                password='password123',
                role='CONSULTANT'
            )
            self.stdout.write(self.style.SUCCESS('Consultant user created (consultant / password123)'))

        # Create Form Template
        if not FormTemplate.objects.filter(name='Estudio Básico').exists():
            FormTemplate.objects.create(
                name='Estudio Básico',
                structure={
                    "questions": [
                        {"key": "full_name", "label": "Nombre Completo"},
                        {"key": "address", "label": "Dirección Actual"},
                        {"key": "income", "label": "Ingresos Mensuales"}
                    ]
                }
            )
            self.stdout.write(self.style.SUCCESS('Default form template created'))
