from django.db import models
from django.urls import reverse
from ckeditor.fields import RichTextField
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name;
    
    def get_absolute_url(self):
        return reverse('category-view', args=[str(self.id)])

    class Meta:
        verbose_name_plural = "Categories"

class Post(models.Model):
    title = models.CharField(max_length=255, null=True, blank=True)
    # body = models.TextField(null=True, blank=True)
    body = RichTextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    date_updated = models.DateTimeField(auto_now=True, null=True, blank=True)
    author = models.ForeignKey('Author', on_delete=models.SET_NULL, null=True, blank=True)
    categories = models.ManyToManyField(Category, blank=True)
    summary = models.TextField(null=True, blank=True)
    image = models.CharField(max_length=255, null=True, blank=True)
    featured = models.BooleanField(null=True, default=False, blank=True)
    secondaryFeatured = models.BooleanField(null=True, default=False, blank=True)


    class Meta:
        ordering = ['-date_created']
    
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

class Comment(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    post = models.ForeignKey(Post, related_name="comments", on_delete=models.CASCADE)
    body = models.TextField(blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True, null=True,blank=True)

class Subscriber(models.Model):
    email = models.EmailField(null=True, blank=True)
    conf_num = models.CharField(max_length=15)
    confirmed = models.BooleanField(default=False)

    def __str__(self):
        return self.email + " (" + ("not " if not self.confirmed else "") + "confirmed)"