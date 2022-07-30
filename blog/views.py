from django.shortcuts import render
from .models import Post, Author, Category
from django.views import generic
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy

def index(request):
    categories = Category.objects.all()
    return render(request, 'index.html', {'categories': categories})

def about(request):
    return render(request, 'about.html')

class PostListView(generic.ListView):
    model = Post
    paginate_by = 5

class PostDetailView(generic.DetailView):
    model = Post

class PostCreate(CreateView):
    model = Post
    fields = ['title', 'body', 'author', 'categories']

class PostUpdate(UpdateView):
    model = Post
    fields = ['title', 'body', 'author', 'categories']

class PostDelete(DeleteView):
    model = Post
    success_url = reverse_lazy('posts')

class CategoryDetailView(generic.DetailView):
    model = Category

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['post_list'] = Post.objects.filter(categories=self.kwargs['pk'])
        return context