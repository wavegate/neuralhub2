from django.shortcuts import render
from .models import Post, Author
from django.views import generic
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy

def index(request):
    return render(request, 'index.html')

def about(request):
    return render(request, 'about.html')

class PostListView(generic.ListView):
    model = Post
    paginate_by = 5

class PostDetailView(generic.DetailView):
    model = Post

class PostCreate(CreateView):
    model = Post
    fields = ['title', 'body', 'author']

class PostUpdate(UpdateView):
    model = Post
    fields = ['title', 'body', 'author']

class PostDelete(DeleteView):
    model = Post
    success_url = reverse_lazy('posts')