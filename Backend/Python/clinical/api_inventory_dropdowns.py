
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem

class InventoryDropdownsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        category = request.query_params.get('category')
        brand = request.query_params.get('brand')
        # No params: return all categories
        if not category and not brand:
            categories = InventoryItem.objects.values_list('category', flat=True).distinct()
            unique_categories = sorted(set(categories))
            return Response({'categories': unique_categories}, status=status.HTTP_200_OK)
        # category only: return brands for that category
        if category and not brand:
            brands = InventoryItem.objects.filter(category=category).values_list('brand', flat=True).distinct()
            unique_brands = sorted(set(brands))
            return Response({'brands': unique_brands}, status=status.HTTP_200_OK)
        # category and brand: return models for that category and brand
        if category and brand:
            models = InventoryItem.objects.filter(category=category, brand=brand).values_list('model_type', flat=True).distinct()
            unique_models = sorted(set(models))
            return Response({'models': unique_models}, status=status.HTTP_200_OK)
        # If only brand is provided (should not happen), return error
        return Response({'error': 'Invalid parameters. Provide category or category+brand.'}, status=status.HTTP_400_BAD_REQUEST)
