from rest_framework import viewsets
from .serializers import SpendingSerializer, CategorySerializer
from .models import Spending, Category
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from datetime import datetime
from .models import Spending, Category
from .utils.gpt_utils import GPTQueryHandler

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

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def query_spendings(request):
    """
    Allows user to query their spendings in natural language.
    The GPT model returns structured JSON, which we use to form a safe query.
    """
    user_prompt = request.data.get("prompt", "")
    if not user_prompt:
        return Response({"error": "No prompt provided."}, status=400)

    # Initialize GPT handler
    gpt_handler = GPTQueryHandler()
    gpt_response = gpt_handler.parse_query(user_prompt)  # structured JSON

    # If there's an error, return it
    if "error" in gpt_response:
        return Response({"error": gpt_response["error"]}, status=400)

    # Extract fields
    action = gpt_response.get("action")
    category_name = gpt_response.get("category", "all")
    start_date = gpt_response.get("start_date")
    end_date = gpt_response.get("end_date")
    print("DEBUG filters:", category_name, start_date, end_date)

    try:
        if category_name is None:
            category_name = "all"
        # Build a safe Django query
        spendings_qs = Spending.objects.filter(user=request.user)
        if category_name.lower() != "all":
            spendings_qs = spendings_qs.filter(category__name__iexact=category_name)
        if start_date:
            spendings_qs = spendings_qs.filter(date__gte=start_date)
        if end_date:
            spendings_qs = spendings_qs.filter(date__lte=end_date)

        if action == "sum_spending":
            total = spendings_qs.aggregate(sum=Sum('amount'))["sum"] or 0
            return Response({"result": f"You spent ${total}."})

        elif action == "list_spending":
            # Example: return a list of matching spendings
            data = []
            for s in spendings_qs:
                data.append({
                    "name": s.name,
                    "amount": str(s.amount),
                    "date": str(s.date),
                    "category": s.category.name if s.category else "Uncategorized"
                })
            return Response({"result": data})

        else:
            return Response({"error": "Unknown action."}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=500)