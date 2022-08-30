from django.urls import path
from . import views

urlpatterns = [
   path('', views.index, name='index'),
   path('about/', views.about, name='about'),
   path('create/', views.PostCreateView.as_view(), name='post-create'),
   path('<int:pk>/', views.PostDetailView.as_view(), name='post-view'),
   path('<int:pk>/update/', views.PostUpdateView.as_view(), name='post-update'),
   path('<int:pk>/delete/', views.PostDeleteView.as_view(), name='post-delete'),
   path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-view'),
   path('<int:pk>/create_comment/', views.CommentCreateView.as_view(), name='comment-create'),
   path('subscribe/', views.subscribe, name='subscribe'),
   path('subscribe/confirm/', views.confirm_subscription, name='confirm-subscription'),
   path('subscribe/delete/', views.delete_subscription, name='delete-subscription'),
   path('confirm/', views.confirm_subscription, name='confirm-subscription'),
   path('topics/', views.topics, name='topics'),
   path('search/', views.search, name='search'),
   path('addVote/<int:pk>/', views.addVote, name='addVote'),
   path('addVote/', views.addDeadVote, name='addDeadVote'),
   path('twoback/', views.twoback, name='twoback'),
   path('gonogo/', views.gonogo, name='gonogo'),
   path('stroop/', views.stroop, name='stroop'),
   path('subitizing/', views.subitizing, name='subitizing'),
   path('task_switching/', views.task_switching, name='task_switching'),
   path('posner/', views.posner, name='posner'),
   path('visual_search/', views.visual_search, name='visual_search'),
   path('rotation/', views.rotation, name='rotation'),
   path('clock/', views.clock, name='clock'),
   path('add_experiment/', views.add_experiment, name='add_experiment'),
   path('portfolio/', views.portfolio, name='portfolio'),
   path('portfolio_contact/', views.portfolio_contact, name='portfolio_contact'),
   path('generate_pdf/', views.generate_pdf, name='generate_pdf'),
]