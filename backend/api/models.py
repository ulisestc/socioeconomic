from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('CONSULTANT', 'Consultant'),
        ('APPLICANT', 'Applicant'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='APPLICANT')
    is_privacy_notice_accepted = models.BooleanField(default=False)
    privacy_acceptance_ip = models.GenericIPAddressField(null=True, blank=True)
    privacy_acceptance_timestamp = models.DateTimeField(null=True, blank=True)
    temp_password = models.CharField(max_length=128, blank=True, null=True)
    # True para solicitantes recién creados: fuerza el multi-step de primer login
    # (cambiar usuario a su correo + nueva contraseña). Ver views.change_credentials.
    must_change_credentials = models.BooleanField(default=False)



class FormTemplate(models.Model):
    name = models.CharField(max_length=255)
    structure = models.JSONField(help_text="JSON structure of the form")
    created_at = models.DateTimeField(auto_now_add=True)

class Application(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('FILLED', 'Filled'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    form_template = models.ForeignKey(FormTemplate, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    verification_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Response(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='responses')
    question_key = models.CharField(max_length=100)
    answer = models.JSONField()

class Attachment(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='attachments')
    question_key = models.CharField(max_length=100)
    file = models.ImageField(upload_to='evidences/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
