from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Servir media (imágenes subidas) siempre, también con DEBUG=False, para que
    # WeasyPrint pueda incrustarlas en el PDF y se vean en producción (Railway).
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

