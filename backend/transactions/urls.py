from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SpendingViewSet, CategoryViewSet, query_spendings

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'spendings', SpendingViewSet, basename='spending')

urlpatterns = [
    path('', include(router.urls)),
    path('gpt-query/', query_spendings, name='gpt_query'),
]