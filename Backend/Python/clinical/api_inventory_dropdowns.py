
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem, CATEGORY_CHOICES , Brand, ModelType
from .serializers import InventoryItemSerializer, BrandSerializer, ModelTypeSerializer

class InventoryDropdownsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        category = request.query_params.get('category')
        brand = request.query_params.get('brand')
        # No params: return all categories
        if not category and not brand:
            categories = list(CATEGORY_CHOICES)  # Use the imported CATEGORY_CHOICES directly
            return Response({'categories': [cat[1] for cat in categories]}, status=status.HTTP_200_OK)
        # category only: return brands for that category
        if category and not brand:
            brands = Brand.objects.filter(category=category).distinct()
            unique_brands = BrandSerializer(brands, many=True).data
            return Response({'brands': unique_brands}, status=status.HTTP_200_OK)
        # category and brand: return models for that category and brand
        if category and brand:
            models = ModelType.objects.filter(brand__category=category, brand__name=brand).distinct()
            unique_models = ModelTypeSerializer(models, many=True).data
            return Response({'models': unique_models}, status=status.HTTP_200_OK)
        # If only brand is provided (should not happen), return error
        return Response({'error': 'Invalid parameters. Provide category or category+brand.'}, status=status.HTTP_400_BAD_REQUEST)
