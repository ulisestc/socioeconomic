import os
from django.conf import settings
from django.core.mail import send_mail
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response as DRFResponse
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from weasyprint import HTML

from .models import User, FormTemplate, Application, Response
from .serializers import (
    UserSerializer, FormTemplateSerializer, ApplicationSerializer, 
    CreateApplicantSerializer, ResponseSerializer
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

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return DRFResponse(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsConsultant])
    def create_applicant(self, request):
        serializer = CreateApplicantSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Send Email
            password = request.data.get('password')
            send_mail(
                'Tus credenciales de Estudio Socioeconómico',
                f'Hola {user.username},\n\nSe ha creado tu cuenta. Tus credenciales son:\nUsuario: {user.username}\nPassword: {password}\n\nPor favor inicia sesión para completar tu estudio.',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return DRFResponse(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return DRFResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        return DRFResponse(ApplicationSerializer(application).data)

    @action(detail=True, methods=['post'], permission_classes=[IsApplicant])
    def accept_privacy(self, request, pk=None):
        application = self.get_object()
        user = request.user
        user.is_privacy_notice_accepted = True
        user.save()
        return DRFResponse({'status': 'privacy notice accepted'})

    @action(detail=True, methods=['post'], permission_classes=[IsApplicant])
    def submit_responses(self, request, pk=None):
        application = self.get_object()
        if not request.user.is_privacy_notice_accepted:
            return DRFResponse({'error': 'Must accept privacy notice first'}, status=status.HTTP_400_BAD_REQUEST)
        
        responses_data = request.data.get('responses', [])
        for resp in responses_data:
            Response.objects.create(
                application=application,
                question_key=resp.get('key'),
                answer=resp.get('value')
            )
        
        application.status = 'FILLED'
        application.save()
        return DRFResponse({'status': 'form submitted'})

    @action(detail=True, methods=['post'], permission_classes=[IsConsultant])
    def approve(self, request, pk=None):
        application = self.get_object()
        application.status = 'APPROVED'
        application.verification_notes = request.data.get('notes', '')
        application.save()
        
        # Notificar por correo
        send_mail(
            '¡Tu Estudio Socioeconómico ha sido aprobado!',
            f'Hola {application.applicant.username},\n\nNos complace informarte que tu estudio socioeconómico (Folio #{application.id}) ha sido verificado y aprobado con éxito.\n\nYa puedes consultar el estatus final en la plataforma.\n\nSaludos,\nEquipo de Consultoría',
            settings.DEFAULT_FROM_EMAIL,
            [application.applicant.email],
            fail_silently=False,
        )
        
        return DRFResponse(ApplicationSerializer(application).data)

    @action(detail=True, methods=['get'], permission_classes=[IsConsultant])
    def export_pdf(self, request, pk=None):
        application = self.get_object()
        html_string = render_to_string('pdf_template.html', {'application': application})
        html = HTML(string=html_string)
        pdf = html.write_pdf()
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="estudio_{application.id}.pdf"'
        return response
