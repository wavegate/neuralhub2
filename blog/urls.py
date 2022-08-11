from django.urls import path
from . import views

urlpatterns = [
   # path('', views.PostListView.as_view(), name='posts'),
   path('', views.index, name='index'),
   path('about', views.about, name='about'),
   path('create', views.PostCreateView.as_view(), name='post-create'),
   path('<int:pk>', views.PostDetailView.as_view(), name='post-view'),
   path('<int:pk>/update/', views.PostUpdateView.as_view(), name='post-update'),
   path('<int:pk>/delete/', views.PostDeleteView.as_view(), name='post-delete'),
   path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-view'),
   path('<int:pk>/create_comment', views.CommentCreateView.as_view(), name='comment-create'),
   path('subscribe', views.subscribe, name='subscribe'),
   path('subscribe/confirm/', views.confirm_subscription, name='confirm-subscription'),
   path('subscribe/delete/', views.delete_subscription, name='delete-subscription'),
   # path('index', views.index, name='index'),
   path('confirm/', views.confirm_subscription, name='confirm-subscription'),
   path('topics', views.topics, name='topics'),
   path('search', views.search, name='search'),
   path('addVote/<int:pk>', views.addVote, name='addVote'),
   path('addVote', views.addDeadVote, name='addDeadVote'),
]