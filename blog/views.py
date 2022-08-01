from django.shortcuts import render
from .models import Post, Author, Category, Comment
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

class PostCreateView(CreateView):
    model = Post
    fields = ['title', 'body', 'author', 'categories']

class CommentCreateView(CreateView):
    model = Comment
    fields = ['name', 'body']

    def form_valid(self, form):
        form.instance.post_id = self.kwargs['pk']
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('post-view', kwargs={'pk': self.kwargs['pk']})

class PostUpdateView(UpdateView):
    model = Post
    fields = ['title', 'body', 'author', 'categories']

class PostDeleteView(DeleteView):
    model = Post
    success_url = reverse_lazy('posts')

class CategoryDetailView(generic.DetailView):
    model = Category

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['post_list'] = Post.objects.filter(categories=self.kwargs['pk'])
        return context