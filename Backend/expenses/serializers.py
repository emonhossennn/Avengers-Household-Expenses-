from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    paid_by_name = serializers.CharField(
        source="paid_by.name",
        read_only=True,
    )

    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True,
    )

    class Meta:
        model = Expense

        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_display",
            "amount",
            "paid_by",
            "paid_by_name",
            "expense_date",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "paid_by_name",
            "category_display",
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Expense amount must be greater than zero."
            )

        return value