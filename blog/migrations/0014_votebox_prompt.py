# Generated by Django 4.0.6 on 2022-08-11 00:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0013_remove_post_script_remove_post_scripttype'),
    ]

    operations = [
        migrations.AddField(
            model_name='votebox',
            name='prompt',
            field=models.TextField(blank=True, null=True),
        ),
    ]
