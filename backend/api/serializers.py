from rest_framework import serializers
from .models import User, FormTemplate, Application, Response, Attachment
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'is_privacy_notice_accepted', 'first_name', 'last_name', 'privacy_acceptance_ip', 'privacy_acceptance_timestamp')

class FormTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormTemplate
        fields = ('id', 'name', 'structure', 'created_at')

class ResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Response
        fields = ('id', 'question_key', 'answer')

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ('id', 'question_key', 'file', 'uploaded_at')

class ApplicationSerializer(serializers.ModelSerializer):
    applicant = UserSerializer(read_only=True)
    form_template = FormTemplateSerializer(read_only=True)
    responses = ResponseSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Application
        fields = ('id', 'applicant', 'form_template', 'status', 'verification_notes', 'responses', 'attachments', 'created_at', 'updated_at')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.role == 'APPLICANT':
            ret.pop('verification_notes', None)
        return ret

class CreateApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name') # username is now auto-generated
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def create(self, validated_data):
        from django.utils.crypto import get_random_string
        import re
        
        # Generar username automáticamente: inicial + apellido + random
        fn = validated_data['first_name'].lower()
        ln = validated_data['last_name'].lower().split()[0] # Primer apellido
        # Quitar caracteres especiales
        ln = re.sub(r'[^a-z0-9]', '', ln)
        base_username = f"{fn[0]}{ln}"[:10]
        username = f"{base_username}{get_random_string(4, '0123456789')}"
        
        # Generar contraseña aleatoria
        password = get_random_string(12)
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=password,
            role='APPLICANT'
        )
        return user
