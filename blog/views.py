from django.shortcuts import render
from .models import Post, Author, Category, Comment, Subscriber
from django.views import generic
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse, reverse_lazy
import re
from django.contrib import messages
from django.http import HttpResponseRedirect
import random
from django.core.mail import send_mail

def index(request):
    featuredPost = Post.objects.filter(featured=True)[0]
    secondaryFeaturedPosts = Post.objects.filter(secondaryFeatured=True)[0:2]
    nonFeaturedPosts = Post.objects.filter(featured=False,secondaryFeatured=False)
    context = {
        "featuredPost": featuredPost,
        "secondaryFeaturedPosts": secondaryFeaturedPosts,
        "nonFeaturedPosts": nonFeaturedPosts,
    }

    if request.method == 'POST':
        sub = Subscriber(email=request.POST['email'], conf_num=random_digits())
        sub.save()
        to_emails=[sub.email]
        subject='Blog Subscription Confirmation'
        html_content='Thank you for signing up for my email newsletter! Please complete the process by <a href="{}/confirm/?email={}&conf_num={}"> clicking here to confirm your registration</a>.'.format(request.build_absolute_uri(), sub.email, sub.conf_num)
        send_mail(subject, html_content, None, to_emails, fail_silently=False, html_message=html_content)
        messages.add_message(request, messages.SUCCESS, 'Thank you for subscribing! Please confirm your subscription in your email.')
    
    return render(request, 'index.html', context)

def about(request):
    return render(request, 'about.html')

def random_digits():
    return "%0.12d" % random.randint(0, 99999999999)

def subscribe(request):
    if request.method == 'POST':
        sub = Subscriber(email=request.POST['email'], conf_num=random_digits())
        sub.save()
        to_emails=[sub.email]
        subject='Blog Subscription Confirmation'
        html_content='Thank you for signing up for my email newsletter! Please complete the process by <a href="{}/confirm/?email={}&conf_num={}"> clicking here to confirm your registration</a>.'.format(request.build_absolute_uri(), sub.email, sub.conf_num)
        send_mail(subject, html_content, None, to_emails, fail_silently=False, html_message=html_content)
    return render(request, 'subscribe.html')

def confirm_subscription(request):
    sub = Subscriber.objects.get(email=request.GET['email'])
    if sub.conf_num == request.GET['conf_num']:
        sub.confirmed = True
        sub.save()
        return render(request, 'confirm_subscription.html', {'email': sub.email, 'action': 'confirmed'})
    else:
        return render(request, 'confirm_subscription.html', {'email': sub.email, 'action': 'denied'})

def delete_subscription(request):
    sub = Subscriber.objects.get(email=request.GET['email'])
    if sub.conf_num == request.GET['conf_num']:
        sub.delete()
        return render(request, 'confirm_subscription.html', {'email': sub.email, 'action': 'unsubscribed'})
    else:
        return render(request, 'confirm_subscription.html', {'email': sub.email, 'action': 'denied'})

class PostListView(generic.ListView):
    model = Post
    paginate_by = 5

class PostDetailView(generic.DetailView):
    model = Post

class PostCreateView(CreateView):
    model = Post
    fields = ['title', 'body', 'author', 'categories', 'summary', 'image', 'featured', 'secondaryFeatured']

    def form_valid(self, form):
        subscribers = Subscriber.objects.filter(confirmed=True)
        from_email = None
        subject = form.cleaned_data['title']
        for sub in subscribers:
            to_emails = [sub.email]
            html_content = form.cleaned_data['body'] + ('<br><a href="{}/delete/?email={}&conf_num={}">Unsubscribe</a>.').format(self.request.build_absolute_uri('/subscribe'), sub.email, sub.conf_num)
            send_mail(subject, html_content, from_email, to_emails, fail_silently=False, html_message=html_content)
        return super().form_valid(form)

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