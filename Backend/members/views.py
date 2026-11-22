from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MealCount, Member
from .serializers import MealCountSerializer, MemberSerializer


class MemberViewSet(viewsets.ModelViewSet):
    """
    API for the four house members.

    GET  /api/members/        — list all
    GET  /api/members/<id>/   — detail
    PATCH /api/members/<id>/  — update name only
    """

    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]
    http_method_names = ["get", "patch", "head", "options"]


class MealCountView(APIView):
    """
    GET  /api/members/meals/?year=&month=  — get all meal counts for month
    POST /api/members/meals/               — set/update meal count for a member
    """

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            year = int(request.query_params.get("year", 2026))
            month = int(request.query_params.get("month", 1))
        except ValueError:
            return Response(
                {"error": "Invalid year or month."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        meal_counts = (
            MealCount.objects
            .filter(year=year, month=month)
            .select_related("member")
        )

        serializer = MealCountSerializer(meal_counts, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            member_id = int(request.data["member_id"])
            year = int(request.data["year"])
            month = int(request.data["month"])
            meals = int(request.data["meals"])
        except (KeyError, TypeError, ValueError):
            return Response(
                {"error": "Invalid data. Provide member_id, year, month, meals."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if meals < 0:
            return Response(
                {"error": "Meals cannot be negative."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response(
                {"error": "Member not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        meal_count, created = MealCount.objects.update_or_create(
            member=member,
            year=year,
            month=month,
            defaults={"meals": meals},
        )

        serializer = MealCountSerializer(meal_count)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
