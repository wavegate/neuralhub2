from django.db import models
from django.urls import reverse
from ckeditor.fields import RichTextField

class Post(models.Model):
    title = models.CharField(max_length=255, null=True, blank=True)
    # body = models.TextField(null=True, blank=True)
    body = RichTextField(blank=True, null=True)
    date_created = models.DateTimeField(null=True, blank=True)
    date_updated = models.DateTimeField(auto_now=True, null=True, blank=True)
    author = models.ForeignKey('Author', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('post-view', args=[str(self.id)])

class Author(models.Model):
    username = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.username

    def get_absolute_url(self):
        return reverse('author-view', args=[str(self.id)])