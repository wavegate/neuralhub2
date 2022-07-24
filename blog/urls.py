from django.urls import path
from . import views

urlpatterns = [
   path('', views.PostListView.as_view(), name='posts'),
   path('create/', views.PostCreate.as_view(), name='post-create'),
   path('<int:pk>', views.PostDetailView.as_view(), name='post-view'),
   path('<int:pk>/update/', views.PostUpdate.as_view(), name='post-update'),
   path('<int:pk>/delete/', views.PostDelete.as_view(), name='post-delete'),
]