from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q
from datetime import datetime
from .models import Spending, Category
from .serializers import SpendingSerializer, CategorySerializer
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

def parse_date(date_str):
    """
    Helper function to safely parse date strings.
    """
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def query_spendings(request):
    """
    Allows user to query their spendings in natural language.
    """
    user_prompt = request.data.get("prompt", "")
    if not user_prompt:
        return Response({"error": "No prompt provided."}, status=400)

    gpt_handler = GPTQueryHandler()
    gpt_response = gpt_handler.parse_query(user_prompt)  # structured JSON

    # If there's an error, return it
    if "error" in gpt_response:
        return Response({"error": gpt_response["error"]}, status=400)

    # Extract fields from GPT's response
    action = gpt_response.get("action", "")
    category_name = gpt_response.get("category", "all")
    name_substring = gpt_response.get("name", None)
    start_date = parse_date(gpt_response.get("start_date"))
    end_date = parse_date(gpt_response.get("end_date"))

    spendings_qs = Spending.objects.filter(user=request.user)

    try:
        # Filter by category
        if isinstance(category_name, str):
            if category_name.lower() != "all":
                spendings_qs = spendings_qs.filter(category__name__iexact=category_name)
        elif isinstance(category_name, list):
            queries = Q()
            for cat in category_name:
                queries |= Q(category__name__iexact=cat)
            spendings_qs = spendings_qs.filter(queries)

        # Filter by name substring
        if name_substring:
            spendings_qs = spendings_qs.filter(name__icontains=name_substring)

        # Filter by date range
        if start_date:
            spendings_qs = spendings_qs.filter(date__gte=start_date)
        if end_date:
            spendings_qs = spendings_qs.filter(date__lte=end_date)

        # Perform action based on GPT response
        if action == "sum_spending":
            total = spendings_qs.aggregate(sum=Sum('amount'))["sum"] or 0
            return Response({"result": f"You spent ${total}."})
        elif action == "list_spending":
            data = [
                {
                    "name": s.name,
                    "amount": str(s.amount),
                    "date": str(s.date),
                    "category": s.category.name if s.category else "Uncategorized"
                }
                for s in spendings_qs
            ]
            return Response({"result": data})
        else:
            return Response({"error": "Unknown action."}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)