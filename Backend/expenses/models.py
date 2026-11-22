

from django.db import models
from members.models import Member


class ExpenseCategory(models.TextChoices):
    RENT = "RENT", "Rent"
    GROCERY = "GROCERY", "Grocery"
    ELECTRICITY = "ELECTRICITY", "Electricity"
    INTERNET = "INTERNET", "Internet"
    WATER = "WATER", "Water"
    GAS = "GAS", "Gas"
    MAID = "MAID", "Maid"
    ACCESSORIES = "ACCESSORIES", "Accessories"
    CLEANING = "CLEANING", "Cleaning"
    OTHER = "OTHER", "Other"





class Expense(models.Model):
    title = models.CharField(max_length=100)

    description = models.TextField(
        blank=True,
        null=True,
    )

    category = models.CharField(
        max_length=20,
        choices=ExpenseCategory.choices,
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    paid_by = models.ForeignKey(
        Member,
        on_delete=models.PROTECT,
        related_name="expenses",
    )

    expense_date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-expense_date", "-created_at"]

    def __str__(self):
        return f"{self.title} - ৳{self.amount}"


