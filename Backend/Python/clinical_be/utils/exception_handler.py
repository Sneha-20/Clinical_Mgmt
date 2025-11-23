from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.exceptions import NotAuthenticated


def custom_exception_handler(exc, context):
    # Let DRF handle the default exception first
    response = exception_handler(exc, context)

    # Catch SimpleJWT InvalidToken error
    if isinstance(exc, InvalidToken) or isinstance(exc, TokenError):
        messages = exc.detail.get('messages', [])
        if messages:
            # Example: {'message': 'Token is expired'}
            msg = messages[0].get('message', '').lower()
            if "expired" in msg:
                return Response(
                    {"status": 401, "error": "Token is expired"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # For any other JWT errors
        return Response(
            {"status": 401, "error": "Invalid token"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if isinstance(exc, NotAuthenticated):
        return Response(
            {
                "status": 401,
                "error": "Authentication credentials were not provided"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    return response
