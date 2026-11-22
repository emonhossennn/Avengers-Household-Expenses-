from django.contrib import admin
from .models import SettlementPayment


@admin.register(SettlementPayment)
class SettlementPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "year",
        "month",
        "from_member",
        "to_member",
        "amount",
        "is_paid",
        "paid_at",
    )

    list_filter = (
        "year",
        "month",
        "is_paid",
    )

    search_fields = (
        "from_member__name",
        "to_member__name",
    )
