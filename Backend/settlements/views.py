from django.utils import timezone

from rest_framework import status

from rest_framework.permissions import AllowAny

from rest_framework.response import Response

from rest_framework.views import APIView

from .models import SettlementPayment

from .serializers import SettlementPaymentSerializer
from .services import calculate_settlements

class SettlementSummaryView(APIView):
    """
    Return the recommended money transfers
    required to settle a specific month.
    """

    permission_classes = [AllowAny]

    def get(self, request):
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

            result = calculate_settlements(
                year=year,
                month=month,
            )

            return Response(
                result,
                status=status.HTTP_200_OK,
            )

        except ValueError as error:
            return Response(
                {
                    "error": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
class SettlementPaymentView(APIView):
    """
    Return and update settlement payment status
    for a specific month.
    """

    permission_classes = [AllowAny]

    def get(self, request):
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

        except ValueError:
            return Response(
                {
                    "error": (
                        "Year and month must be "
                        "valid numbers."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        payments = (
            SettlementPayment.objects
            .filter(
                year=year,
                month=month,
            )
            .select_related(
                "from_member",
                "to_member",
            )
        )

        serializer = SettlementPaymentSerializer(
            payments,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        try:
            year = int(
                request.data["year"]
            )

            month = int(
                request.data["month"]
            )

            from_member_id = int(
                request.data["from_member_id"]
            )

            to_member_id = int(
                request.data["to_member_id"]
            )

            amount = request.data["amount"]

        except (
            KeyError,
            TypeError,
            ValueError,
        ):
            return Response(
                {
                    "error": (
                        "Invalid settlement data."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment, created = (
            SettlementPayment.objects
            .update_or_create(
                year=year,
                month=month,
                from_member_id=from_member_id,
                to_member_id=to_member_id,
                defaults={
                    "amount": amount,
                    "is_paid": True,
                    "paid_at": timezone.now(),
                },
            )
        )

        serializer = SettlementPaymentSerializer(
            payment,
        )

        return Response(
            serializer.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )

    def delete(self, request):
        try:
            payment_id = int(
                request.query_params["id"]
            )

        except (
            KeyError,
            TypeError,
            ValueError,
        ):
            return Response(
                {
                    "error": (
                        "A valid settlement "
                        "payment ID is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment = (
                SettlementPayment.objects.get(
                    id=payment_id
                )
            )

        except SettlementPayment.DoesNotExist:
            return Response(
                {
                    "error": (
                        "Settlement payment "
                        "not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        payment.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )