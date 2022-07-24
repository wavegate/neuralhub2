from django.test import TestCase
from blog.models import Post

class PostModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        Post.objects.create(title='Title1', body='body1')

    def setUp(self):
        print("setUp: Run once for every test method to set up clean data.")
        pass