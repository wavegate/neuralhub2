from django.urls import path
from . import views

urlpatterns = [
   path('', views.PostListView.as_view(), name='posts'),
   path('about', views.about, name='about'),
   path('create', views.PostCreateView.as_view(), name='post-create'),
   path('<int:pk>', views.PostDetailView.as_view(), name='post-view'),
   path('<int:pk>/update/', views.PostUpdateView.as_view(), name='post-update'),
   path('<int:pk>/delete/', views.PostDeleteView.as_view(), name='post-delete'),
   path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-view'),
   path('<int:pk>/create_comment', views.CommentCreateView.as_view(), name='comment-create'),
]