from .models import Post, Author, Category

def add_variable_to_context(request):
    return {
        'categories': Category.objects.all()
    }