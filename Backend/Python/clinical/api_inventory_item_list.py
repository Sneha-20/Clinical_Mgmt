from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem, InventorySerial
from .serializers import InventoryItemSerializer, InventorySerialDetailSerializer
from clinical_be.utils.permission import IsClinicAdmin, AuditorPermission
from clinical_be.utils.pagination import StandardResultsSetPagination
from rest_framework.generics import ListAPIView

class InventoryItemListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin]
    pagination_class = StandardResultsSetPagination


    def get(self, request, format=None):
        items = InventoryItem.objects.all().order_by('-id')
        # Always compute counts on the full unfiltered list
        all_items = list(items)
        low_count = sum(1 for item in all_items if item.status.lower() == 'low')
        critical_count = sum(1 for item in all_items if item.status.lower() == 'critical')

        status_param = request.query_params.get('status')
        use_in_trial = request.query_params.get('use_in_trial') # true or false
        if status_param:
            items = [item for item in all_items if item.status.lower() == status_param.lower()]
        if use_in_trial is not None:
            use_in_trial_bool = use_in_trial.lower() == 'true'
            items = [item for item in items if item.use_in_trial == use_in_trial_bool]

        page = self.paginate_queryset(items)

        if page is not None:
            serializer = InventoryItemSerializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['low_count'] = low_count
            response.data['critical_count'] = critical_count
            return response
        serializer = InventoryItemSerializer(items, many=True)
        return Response({
            'low_count': low_count,
            'critical_count': critical_count,
            'results': serializer.data
            
        }, status=status.HTTP_200_OK)



# Get the InventorySerial info for a product ( inventoryItem)
class InventorySerialListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | AuditorPermission ]
    pagination_class = StandardResultsSetPagination

    def get(self, request, format=None):
        inventory_item = request.query_params.get('inventory_item')
        
        if not inventory_item:
            return Response({"error": "inventory_item is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        inventory_serials = InventorySerial.objects.filter(inventory_item=inventory_item)
        page = self.paginate_queryset(inventory_serials)
        if page is not None:
            serializer = InventorySerialDetailSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = InventorySerialDetailSerializer(inventory_serials, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
