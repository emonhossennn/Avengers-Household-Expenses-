from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "amount",
        "paid_by",
        "expense_date",
    )

    list_filter = (
        "category",
        "expense_date",
    )

    search_fields = (
        "title",
        "paid_by__name",
    )
