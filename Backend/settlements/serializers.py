from rest_framework import serializers

from .models import SettlementPayment


class SettlementPaymentSerializer(
    serializers.ModelSerializer
):
    from_member = serializers.IntegerField(
        source="from_member_id",
        read_only=True,
    )

    to_member = serializers.IntegerField(
        source="to_member_id",
        read_only=True,
    )

    class Meta:
        model = SettlementPayment

        fields = [
            "id",
            "year",
            "month",
            "from_member",
            "to_member",
            "amount",
            "is_paid",
            "paid_at",
        ]

        read_only_fields = [
            "id",
            "paid_at",
        ]