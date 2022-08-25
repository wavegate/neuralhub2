from import_export.admin import ImportExportModelAdmin
from import_export import resources
from django.contrib import admin
from .models import Post, Author, Category, Comment, Subscriber, VoteBox, VoteOption, Experiment

class PostResource(resources.ModelResource):

    class Meta:
        model = Post

class PostAdmin(ImportExportModelAdmin):
    resource_class = PostResource

admin.site.register(Post, PostAdmin)
admin.site.register(Author)
admin.site.register(Category)
admin.site.register(Comment)
admin.site.register(Subscriber)
admin.site.register(VoteBox)
admin.site.register(VoteOption)
admin.site.register(Experiment)