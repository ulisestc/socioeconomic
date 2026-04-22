from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, FormTemplate, Application, Response

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'is_privacy_notice_accepted')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role', 'is_privacy_notice_accepted')}),
    )
    list_display = ('username', 'email', 'role', 'is_staff', 'is_privacy_notice_accepted')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')

@admin.register(FormTemplate)
class FormTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'form_template', 'status', 'created_at')
    list_filter = ('status', 'form_template')
    search_fields = ('applicant__username', 'applicant__email')

@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ('application', 'question_key', 'answer')
    list_filter = ('application',)

admin.site.register(User, CustomUserAdmin)
