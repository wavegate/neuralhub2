from django.contrib import admin
from .models import Post, Author, Category, Comment, Subscriber

admin.site.register(Post)
admin.site.register(Author)
admin.site.register(Category)
admin.site.register(Comment)
admin.site.register(Subscriber)