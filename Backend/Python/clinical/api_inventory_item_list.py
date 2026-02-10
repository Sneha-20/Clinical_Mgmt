from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem, InventorySerial,InventoryTransfer
from .serializers import InventoryItemSerializer, InventorySerialDetailSerializer,InventoryTransferSerializer
from clinical_be.utils.permission import IsClinicAdmin, AuditorPermission, ReceptionistPermission
from clinical_be.utils.pagination import StandardResultsSetPagination
from rest_framework.generics import ListAPIView

class InventoryItemListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission ]
    pagination_class = StandardResultsSetPagination

    def get(self, request, format=None):
        # Filter items based on user's clinic
        if request.user.role.name == 'Admin':
            items = InventoryItem.objects.filter(is_approved=True).order_by('-id')
            # Admin can filter by specific clinic_id via query param
            clinic_id = request.query_params.get('clinic_id')
            if clinic_id:
                items = items.filter(clinic_id=clinic_id)
        elif request.user.role.name == 'Clinic Manager':
            # Clinic Managers see items for their clinic, but can also filter by other clinics they manage
            managed_clinics = request.user.clinic_set.all()
            items = InventoryItem.objects.filter(clinic__in=managed_clinics, is_approved=True).order_by('-id')
            clinic_id = request.query_params.get('clinic_id')
            if clinic_id:
                items = items.filter(clinic_id=clinic_id)
                
        else:
            # Non-admins only see their clinic's inventory
            items = InventoryItem.objects.filter(clinic=request.user.clinic, is_approved=True).order_by('-id')

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
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | AuditorPermission | 
                          ReceptionistPermission ]
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




# API whose inventory item is not approved yet, for clinic admin to see pending items and approve them. This is separate from the main list API to avoid confusion for regular users and to keep the main list clean with only approved items.
class InventoryItemPendingListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get(self, request, format=None):
        if request.user.role.name == 'Admin':
            items = InventoryItem.objects.filter(is_approved=False).order_by('-id')
        elif request.user.role.name == 'Clinic Manager':
            # managed_clinics = request.user.clinic_set.all()
            clinic_id = request.query_params.get('clinic_id')
            if clinic_id:
                items = InventoryItem.objects.filter(clinic_id=clinic_id, is_approved=False).order_by('-id')
            else:   
                items = InventoryItem.objects.filter(clinic__in=request.user.clinic_set.all(), is_approved=False).order_by('-id')
        else:
            items = InventoryItem.objects.filter(clinic=request.user.clinic, is_approved=False).order_by('-id')

        page = self.paginate_queryset(items)
        if page is not None:
            serializer = InventoryItemSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class ApproveInventoryItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            item = InventoryItem.objects.get(pk=pk, is_approved=False)
        except InventoryItem.DoesNotExist:
            return Response({"error": "Pending inventory item not found"}, status=status.HTTP_404_NOT_FOUND)

        item.is_approved = True
        item.save()
        return Response({"status": 200, "message": "Inventory item approved successfully"}, status=status.HTTP_200_OK)
    


class MainInventoryItemListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin ]
    pagination_class = StandardResultsSetPagination
    

    def get(self, request, format=None):
        # get the inventory items whose clinc has is_main__inventory = True, this is for the dropdown when creating a new inventory item, to link it to the main item if it's a distributed copy. Only show approved items in the dropdown.
        if request.user.role.name == 'Admin':
            items = InventoryItem.objects.filter(clinic__is_main_inventory=True, is_approved=True).order_by('-id')

        # elif request.user.role.name == 'Clinic Manager':
        #     managed_clinics = request.user.clinic_set.all()
        #     items = InventoryItem.objects.filter(clinic__in=managed_clinics, clinic__is_main_inventory=True, is_approved=True).order_by('-id')
        # else:
        #     items = InventoryItem.objects.filter(clinic=request.user.clinic, clinic__is_main_inventory=True, is_approved=True).order_by('-id')

        page = self.paginate_queryset(items)
        if page is not None:
            serializer = InventoryItemSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = InventoryItemSerializer(items, many=True)
        return Response({'status': 200, 'data': serializer.data}, status=status.HTTP_200_OK)
    

class InventoryTransferHistoryView(ListAPIView):
    queryset = InventoryTransfer.objects.all().order_by('-transferred_at')
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission ]
    pagination_class = StandardResultsSetPagination
    serializer_class = InventoryTransferSerializer
    