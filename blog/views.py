from django.shortcuts import render
from .models import Post, Category, Comment, Subscriber, VoteBox, VoteOption, Experiment
from django.views import generic
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse, reverse_lazy
from django.contrib import messages
import random
from django.core.mail import send_mail
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
import json

def index(request):
    featuredPost = Post.objects.filter(featured=True,draft=False)[0]
    secondaryFeaturedPosts = Post.objects.filter(secondaryFeatured=True,draft=False)[0:2]
    nonFeaturedPosts = Post.objects.filter(featured=False,secondaryFeatured=False,draft=False)
    context = {
        "featuredPost": featuredPost,
        "secondaryFeaturedPosts": secondaryFeaturedPosts,
        "nonFeaturedPosts": nonFeaturedPosts,
    }
    return render(request, 'index.html', context)

def about(request):
    return render(request, 'about.html')

def random_digits():
    return "%0.12d" % random.randint(0, 99999999999)

def addVote(request, pk):
    voteoption = VoteOption.objects.get(id=pk)
    voteoption.counter = voteoption.counter + 1
    voteoption.save()
    votebox = voteoption.box
    voteoptions = votebox.voteoption_set
    voteoptionnames = list(voteoptions.values_list('name', flat=True))
    voteoptioncounters = list(voteoptions.values_list('counter', flat=True))
    data = {
        'names': voteoptionnames,
        'counters': voteoptioncounters,
    }
    return JsonResponse(data)

def addDeadVote(request):
    return HttpResponseRedirect(request.META.get('HTTP_REFERER')) 

def twoback(request):
    return render(request, 'twoback.html')

def gonogo(request):
    post = Post.objects.filter(title__contains='Go/no-go')[0]
    context = {
        "bloglink": post.get_absolute_url,
    }
    return render(request, 'gonogo.html', context)

def stroop(request):
    post = Post.objects.filter(title__contains='Stroop')[0]
    context = {
        "bloglink": post.get_absolute_url,
    }
    return render(request, 'stroop.html', context)

def subitizing(request):
    post = Post.objects.filter(title__contains='Subitizing')[0]
    context = {
        "bloglink": post.get_absolute_url,
    }
    return render(request, 'subitizing.html', context)
    
def visual_search(request):
    post = Post.objects.filter(title__contains='Visual Search')[0]
    context = {
        "bloglink": post.get_absolute_url,
    }
    return render(request, 'visual_search.html', context)

def task_switching(request):
    post = Post.objects.filter(title__contains='Task Switching')[0]
    context = {
        "bloglink": post.get_absolute_url,
    }
    return render(request, 'task_switching.html', context)

def posner(request):
    return render(request, 'posner.html')

def rotation(request):
    post = Post.objects.filter(title__contains='Mental Rotation')[0]
    context = {
        "bloglink": post.get_absolute_url,
    }
    return render(request, 'rotation.html', context)

def clock(request):
    post = Post.objects.filter(title__contains='Mackworth Clock')[0]
    context = {
        "bloglink": post.get_absolute_url,
    }
    return render(request, 'clock.html', context)

def add_experiment(request):
    if request.method == "POST":
        data = json.loads(request.body.decode("utf-8"))
        e = Experiment(data=data)
        e.save()
    return render(request, 'index.html')

def subscribe(request):
    if request.method == 'POST':
        email = request.POST['email']
        sub = Subscriber.objects.filter(email=email)
        if sub:
            sub = sub[0]
        else:
            sub = Subscriber(email=request.POST['email'], conf_num=random_digits())
            sub.save()
        to_emails=[sub.email]
        subject='CompSci Blog Subscription Confirmation'
        html_content='Thank you for signing up for my email newsletter! Please complete the process by <a href="{}/confirm/?email={}&conf_num={}"> clicking here to confirm your registration</a>.'.format(request.build_absolute_uri(), sub.email, sub.conf_num)
        send_mail(subject, html_content, None, to_emails, fail_silently=False, html_message=html_content)
        messages.add_message(request, messages.SUCCESS, 'Thank you for subscribing! Please confirm your subscription in your email.')
        next = request.POST.get('next', '/')
        return HttpResponseRedirect(next)
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

def confirm_subscription(request):
    sub = Subscriber.objects.get(email=request.GET['email'])
    if sub.conf_num == request.GET['conf_num']:
        sub.confirmed = True
        sub.save()
        messages.add_message(request, messages.SUCCESS, 'Thank you, your email has been confirmed.')
    else:
        messages.add_message(request, messages.ERROR, 'The confirmation for your email was not valid.')
    return HttpResponseRedirect(reverse(index))

def delete_subscription(request):
    sub = Subscriber.objects.get(email=request.GET['email'])
    if sub.conf_num == request.GET['conf_num']:
        sub.delete()
        messages.add_message(request, messages.SUCCESS, 'You have been unsubscribed.')
    else:
        messages.add_message(request, messages.ERROR, 'The confirmation for your email was not valid.')
    return HttpResponseRedirect(reverse(index))

def topics(request):
    categories = Category.objects.all()
    for category in categories:
        category.posts = Post.objects.filter(categories=category,draft=False)
    context = {
        "categories": categories,
    } 
    return render(request, 'topics.html', context)

def search(request):
    if request.method == 'POST':
        search = request.POST['search']
        posts = Post.objects.filter(body__icontains=search,draft=False)
        context = {
            'search': search,
            'posts': posts,
        }
        return render(request, 'search.html', context)
    else:
        return HttpResponseRedirect(reverse(index))

class PostListView(generic.ListView):
    model = Post
    paginate_by = 5

class PostDetailView(generic.DetailView):
    model = Post

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        category = self.get_object().categories.all()
        if category:
            category = category[0]
            context['firstCategory'] = category
            context['morePosts'] = Post.objects.filter(categories=category).exclude(id=self.kwargs['pk'])
        else:
            context['firstCategory'] = None
            context['morePosts'] = None
        return context

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    fields = ['title', 'body', 'author', 'categories', 'summary', 'image', 'featured', 'secondaryFeatured', 'draft']

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

class PostUpdateView(UpdateView, LoginRequiredMixin):
    model = Post
    fields = ['title', 'body', 'author', 'categories', 'summary', 'image', 'featured', 'secondaryFeatured', 'draft']

class PostDeleteView(DeleteView, LoginRequiredMixin):
    model = Post
    success_url = reverse_lazy('posts')

class CategoryDetailView(generic.DetailView):
    model = Category

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['posts'] = Post.objects.filter(categories=self.kwargs['pk'],draft=False)
        return context
