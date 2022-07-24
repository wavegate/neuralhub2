from django import forms, ModelForm

from .models import Post

class PostModelForm(ModelForm):
    class Meta:
        model = Post
        fields = '__all__'