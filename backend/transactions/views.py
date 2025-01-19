from rest_framework import viewsets
from .serializers import SpendingSerializer, CategorySerializer
from .models import Spending, Category
from rest_framework.permissions import IsAuthenticated

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for categories.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SpendingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Spending.
    """
    serializer_class = SpendingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Spending.objects.filter(user=self.request.user).order_by('-date')