from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem
from .serializers import InventoryItemDetailSerializer
from clinical_be.utils.permission import IsClinicAdmin, ReceptionistPermission, ClinicManagerPermission
from collections import defaultdict


class InventoryExcludingHearingAidsView(APIView):
    """
    API to get inventory list excluding Hearing Aids category, organized by category
    """
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission | ClinicManagerPermission]

    def get(self, request, format=None):
        try:
            # Get search query parameter
            search_query = request.query_params.get('search', '').strip()
            
            # Filter items based on user's clinic and exclude Hearing Aids
            if request.user.role.name == 'Reception':
                items = InventoryItem.objects.filter(
                    is_approved=True,
                    use_in_trial=False
                ).exclude(
                    category='Hearing Aid'
                ).order_by('-id')
                
                # Filter by user's clinic
                clinic_id = request.user.clinic_id
                if clinic_id:
                    items = items.filter(clinic_id=clinic_id)
                
                # Apply search by product name if search query provided
                if search_query:
                    items = items.filter(product_name__icontains=search_query)

            # Serialize all items (no pagination)
            serializer = InventoryItemDetailSerializer(items, many=True)
            
            # Organize items by category
            items_by_category = defaultdict(list)
            for item in serializer.data:
                category = item['category']
                items_by_category[category].append(item)
            
            # Convert defaultdict to regular dict for JSON response
            return Response({
                'status': status.HTTP_200_OK,
                'data': dict(items_by_category)
            })

        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
