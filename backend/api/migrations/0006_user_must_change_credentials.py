from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_user_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='must_change_credentials',
            field=models.BooleanField(default=False),
        ),
    ]
