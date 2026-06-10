import os
from collections import defaultdict
from django.conf import settings
from django.core.mail import send_mail
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response as DRFResponse
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from weasyprint import HTML

from django.utils import timezone
from .models import User, FormTemplate, Application, Response, Attachment
from .serializers import (
    UserSerializer, FormTemplateSerializer, ApplicationSerializer, 
    CreateApplicantSerializer, ResponseSerializer, AttachmentSerializer
)

class IsConsultant(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CONSULTANT'

class IsApplicant(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'APPLICANT'

class FormTemplateViewSet(viewsets.ModelViewSet):
    queryset = FormTemplate.objects.all()
    serializer_class = FormTemplateSerializer
    permission_classes = [IsConsultant]

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'CONSULTANT':
            return Application.objects.all()
        return Application.objects.filter(applicant=user)

    def _send_styled_email(self, subject, to_email, context):
        html_message = render_to_string('email_template.html', context)
        send_mail(
            subject,
            '',
            settings.DEFAULT_FROM_EMAIL,
            [to_email],
            html_message=html_message,
            fail_silently=False,
        )

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return DRFResponse(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsConsultant])
    def applicants(self, request):
        applicants = User.objects.filter(role='APPLICANT')
        serializer = UserSerializer(applicants, many=True)
        return DRFResponse(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsConsultant])
    def create_applicant(self, request):
        serializer = CreateApplicantSerializer(data=request.data)
        if serializer.is_valid():
            from django.utils.crypto import get_random_string
            password = get_random_string(12)
            user = serializer.save()
            user.set_password(password)
            user.temp_password = password # Guardar temporalmente para el primer envío
            user.save()
            
            # NO enviar correo todavía (hasta la asignación)
            return DRFResponse(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return DRFResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch', 'delete'], permission_classes=[IsConsultant])
    def manage_applicant(self, request, pk=None):
        try:
            applicant = User.objects.get(pk=pk, role='APPLICANT')
        except User.DoesNotExist:
            return DRFResponse({'error': 'Applicant not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'DELETE':
            applicant.delete()
            return DRFResponse(status=status.HTTP_204_NO_CONTENT)
        
        serializer = UserSerializer(applicant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return DRFResponse(serializer.data)
        return DRFResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def reset_password(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            from django.utils.crypto import get_random_string
            new_password = get_random_string(10)
            user.set_password(new_password)
            user.save()

            self._send_styled_email(
                'Recuperación de credenciales - SES',
                user.email,
                {
                    'title': 'Recuperación de Credenciales',
                    'name': user.first_name,
                    'body_text': 'Has solicitado recuperar tus credenciales de acceso al sistema. Aquí tienes tus nuevos datos temporales:',
                    'info_items': [('Usuario', user.username), ('Nueva Contraseña', new_password)],
                    'button_text': 'Ir al Login',
                    'button_url': f'{settings.FRONTEND_URL}/login'
                }
            )
            return DRFResponse({'status': 'Credentials recovery email sent'})
        except User.DoesNotExist:
            return DRFResponse({'status': 'If the email exists, a reset link has been sent'})


    @action(detail=True, methods=['post'], permission_classes=[IsConsultant])
    def assign_form(self, request, pk=None):
        applicant = User.objects.get(pk=pk)
        form_id = request.data.get('form_id')
        form_template = FormTemplate.objects.get(pk=form_id)
        
        application = Application.objects.create(
            applicant=applicant,
            form_template=form_template,
            status='PENDING'
        )

        # Enviar correo diferido
        if applicant.temp_password:
            subject = 'Tus credenciales y nuevo Estudio Socioeconómico'
            context = {
                'title': 'Bienvenido al Sistema de Estudios Socioeconómicos',
                'name': f"{applicant.first_name} {applicant.last_name}",
                'body_text': 'Se ha creado tu cuenta y se te ha asignado un estudio para completar. Por favor, utiliza las siguientes credenciales para acceder:',
                'info_items': [('Usuario', applicant.username), ('Password', applicant.temp_password)],
                'button_url': f'{settings.FRONTEND_URL}/login'
            }
            applicant.temp_password = None # Se borra tras enviarlo por primera vez
            applicant.save()
        else:
            subject = 'Nuevo Estudio Socioeconómico Asignado'
            context = {
                'title': 'Nuevo Estudio Asignado',
                'name': f"{applicant.first_name} {applicant.last_name}",
                'body_text': f'Se te ha asignado un nuevo estudio socioeconómico (Folio #{application.id}). Por favor inicia sesión con tus credenciales habituales para completarlo.',
                'button_url': f'{settings.FRONTEND_URL}/login'
            }

        self._send_styled_email(subject, applicant.email, context)
        return DRFResponse(ApplicationSerializer(application).data)

    @action(detail=False, methods=['post'], permission_classes=[IsApplicant])
    def accept_privacy(self, request, pk=None):
        user = request.user
        user.is_privacy_notice_accepted = True
        user.privacy_acceptance_ip = request.META.get('REMOTE_ADDR')
        user.privacy_acceptance_timestamp = timezone.now()
        user.save()
        return DRFResponse({'status': 'privacy notice accepted', 'timestamp': user.privacy_acceptance_timestamp})

    @action(detail=True, methods=['post'], permission_classes=[IsApplicant])
    def submit_responses(self, request, pk=None):
        application = self.get_object()
        if not request.user.is_privacy_notice_accepted:
            return DRFResponse({'error': 'Must accept privacy notice first'}, status=status.HTTP_400_BAD_REQUEST)
        
        responses_data = request.data.get('responses', [])
        is_draft = request.data.get('is_draft', False)

        for resp in responses_data:
            Response.objects.update_or_create(
                application=application,
                question_key=resp.get('key'),
                defaults={'answer': resp.get('value')}
            )
        
        if not is_draft:
            application.status = 'FILLED'
            application.save()
            return DRFResponse({'status': 'form submitted'})
        
        return DRFResponse({'status': 'progress saved'})

    @action(detail=True, methods=['post'], permission_classes=[IsConsultant])
    def approve(self, request, pk=None):
        application = self.get_object()
        application.status = 'APPROVED'
        application.verification_notes = request.data.get('notes', '')
        application.save()
        
        # Notificar por correo
        self._send_styled_email(
            '¡Tu Estudio Socioeconómico ha sido aprobado!',
            application.applicant.email,
            {
                'title': 'Estudio Aprobado',
                'name': application.applicant.username,
                'body_text': f'Nos complace informarte que tu estudio socioeconómico (Folio #{application.id}) ha sido verificado y aprobado con éxito.',
                'info_items': [('Folio', f'#{application.id}'), ('Estatus', 'APROBADO')],
                'button_url': f'{settings.FRONTEND_URL}/applicant'
            }
        )
        
        return DRFResponse(ApplicationSerializer(application).data)

    @action(detail=True, methods=['post'], permission_classes=[IsConsultant])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status = 'REJECTED'
        application.verification_notes = request.data.get('notes', '')
        application.save()

        # Notificar al solicitante que debe corregir
        self._send_styled_email(
            'Tu Estudio Socioeconómico requiere correcciones',
            application.applicant.email,
            {
                'title': 'Estudio: Correcciones Requeridas',
                'name': application.applicant.first_name,
                'body_text': f'Tu estudio socioeconómico (Folio #{application.id}) fue revisado y requiere algunos ajustes. Por favor revisa los comentarios, corrige y vuelve a enviarlo.',
                'info_items': [('Folio', f'#{application.id}'), ('Comentarios', application.verification_notes or 'Sin comentarios')],
                'button_url': f'{settings.FRONTEND_URL}/applicant'
            }
        )
        return DRFResponse(ApplicationSerializer(application, context={'request': request}).data)

    @action(detail=True, methods=['get'], permission_classes=[IsConsultant])
    def export_pdf(self, request, pk=None):
        application = self.get_object()
        
        # Estructurar datos para el PDF agrupados por sección
        responses_dict = {r.question_key: r.answer for r in application.responses.all()}
        attachments_by_key = defaultdict(list)
        for a in application.attachments.all():
            attachments_by_key[a.question_key].append(request.build_absolute_uri(a.file.url))

        # El structure es una lista de secciones: [{"section": "...", "questions": [...]}, ...]
        structured_data = []
        form_keys = set()
        for section in application.form_template.structure:
            sec_data = {
                'title': section.get('section', 'Sin Título'),
                'items': []
            }
            for q in section.get('questions', []):
                key = q.get('key')
                form_keys.add(key)
                sec_data['items'].append({
                    'label': q.get('label'),
                    'type': q.get('type'),
                    'answer': responses_dict.get(key, 'N/A'),
                    'image_urls': attachments_by_key.get(key, [])
                })
            structured_data.append(sec_data)

        # Fotos subidas por el entrevistador al corroborar (claves fuera del formulario)
        corroboration_images = []
        for key, urls in attachments_by_key.items():
            if key not in form_keys:
                corroboration_images.extend(urls)

        context = {
            'application': application,
            'structured_data': structured_data,
            'corroboration_images': corroboration_images,
            'today': timezone.now()
        }
        
        html_string = render_to_string('pdf_template.html', context)
        html = HTML(string=html_string, base_url=request.build_absolute_uri())
        pdf = html.write_pdf()
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="estudio_{application.id}.pdf"'
        return response

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        application_id = request.data.get('application')
        question_key = request.data.get('question_key')
        
        application = Application.objects.get(pk=application_id)
        attachment = Attachment.objects.create(
            application=application,
            question_key=question_key,
            file=file
        )
        return DRFResponse(AttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)
