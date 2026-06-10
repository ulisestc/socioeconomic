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
                structure=[
                    {
                        "section": "Datos Personales",
                        "questions": [
                            {"key": "full_name", "label": "Nombre Completo", "type": "text"},
                            {"key": "birthdate", "label": "Fecha de Nacimiento", "type": "text"},
                            {"key": "phone", "label": "Teléfono", "type": "tel"},
                        ],
                    },
                    {
                        "section": "Vivienda",
                        "questions": [
                            {"key": "address", "label": "Dirección Actual", "type": "text"},
                            {"key": "housing_type", "label": "Tipo de Vivienda (propia/rentada)", "type": "text"},
                            {"key": "house_photo", "label": "Foto de la Fachada", "type": "file"},
                        ],
                    },
                    {
                        "section": "Economía del Hogar",
                        "questions": [
                            {"key": "occupation", "label": "Ocupación", "type": "text"},
                            {"key": "income", "label": "Ingresos Mensuales", "type": "number"},
                            {"key": "expenses", "label": "Egresos Mensuales", "type": "number"},
                            {"key": "notes", "label": "Observaciones del Solicitante", "type": "textarea"},
                        ],
                    },
                ]
            )
            self.stdout.write(self.style.SUCCESS('Default form template created'))
