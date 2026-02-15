from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    page_size_query_param = 'pageSize'
    page_query_param = 'page'

    def get_paginated_response(self, data):
        return Response({
            "status": 200,
            "nextPage": self.page.next_page_number() if self.page.has_next() else -1,
            "previousPage": self.page.previous_page_number() if self.page.has_previous() else -1,
            "totalItems": self.page.paginator.count,
            "totalPages": self.page.paginator.num_pages,
            "data": data
        })
