
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
        accessories_type = request.query_params.get('accessories_type')
        implant_system = request.query_params.get('implant_system')

        print("Implant System:", implant_system)


        # No params: return all categories
        if not category and not brand:
            categories = list(CATEGORY_CHOICES)
            return Response({'categories': [cat[1] for cat in categories]}, status=status.HTTP_200_OK)
        # category only: return brands for that category

        if accessories_type: # use only when category is Accessroies
            brands = Brand.objects.filter(category=category, accessories_type=accessories_type).distinct()
            unique_brands = BrandSerializer(brands, many=True).data
            return Response({'brands': unique_brands}, status=status.HTTP_200_OK)
            
        
        if category and not brand:
            if category in ['Diagnostic Equipment','Speech & Therapy Materials']:
                # Skip brand filtering for these categories
                pass
            else:
                brands = Brand.objects.filter(category=category).distinct()
                unique_brands = BrandSerializer(brands, many=True).data
                return Response({'brands': unique_brands}, status=status.HTTP_200_OK)

        # if category == 'Speech & Therapy Materials' then return age dropdown values
        if category == "Speech & Therapy Materials":
            from .models import InventoryItem
            age_groups = InventoryItem.AGE_GROUP_CHOICES
            return Response({
                'age_groups': [
                    {'value': choice[0], 'label': choice[1]} for choice in age_groups
                ]
            }, status=status.HTTP_200_OK)

        # if category == 'Diagnostic Equipment' then return models directly (no brand needed)
        if category == "Diagnostic Equipment":
            models = ModelType.objects.filter(brand__isnull=True).distinct()
            unique_models = ModelTypeSerializer(models, many=True).data
            return Response({'models': unique_models}, status=status.HTTP_200_OK)

        # if the category == 'Cochlear Implant Accessories' then return implant systems
        # •	Internal Implant 
        # •	External Processor 
        print(category)
        if category == "Cochlear Implant Accessories":

            print('Implement', implant_system)
            
            if implant_system == 'External Processor':
                # Return cochlear accessories for external processors
                from .models import InventoryItem
                cochlear_accessories = InventoryItem.COCHLEAR_ACCESSORY_CHOICES
                return Response({
                    'cochlear_accessories': [
                        {'value': choice[0], 'label': choice[1]} for choice in cochlear_accessories
                    ]
                }, status=status.HTTP_200_OK)
        

        # category and brand: return models for that category and brand
        if category and brand:
            models = ModelType.objects.filter(brand__category=category, brand__name=brand).distinct()
            unique_models = ModelTypeSerializer(models, many=True).data
            return Response({'models': unique_models}, status=status.HTTP_200_OK)
        # If only brand is provided (should not happen), return error
        return Response({'error': 'Invalid parameters. Provide category or category+brand.'}, status=status.HTTP_400_BAD_REQUEST)
