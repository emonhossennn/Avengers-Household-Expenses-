from rest_framework import status, viewsets

from rest_framework.permissions import AllowAny

from rest_framework.response import Response

from rest_framework.decorators import action

from .models import Expense

from .serializers import ExpenseSerializer

from .services import get_monthly_summary


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing household expenses.
    """

    queryset = Expense.objects.select_related(
        "paid_by"
    ).all()

    serializer_class = ExpenseSerializer

    permission_classes = [AllowAny]

    @action(
        detail=False,
        methods=["get"],
        url_path="summary",
    )
    def monthly_summary(self, request):
        """
        Get the expense summary for a specific month.

        Example:

        /api/expenses/summary/?year=2026&month=8
        """

        try:
            year = int(
                request.query_params.get(
                    "year",
                    2026,
                )
            )

            month = int(
                request.query_params.get(
                    "month",
                    8,
                )
            )

            summary = get_monthly_summary(
                year=year,
                month=month,
            )

            return Response(
                summary,
                status=status.HTTP_200_OK,
            )

        except ValueError as error:
            return Response(
                {
                    "error": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )