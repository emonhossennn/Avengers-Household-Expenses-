
# Create your models here.
from django.db import models

from members.models import Member


class SettlementPayment(models.Model):
    year = models.PositiveIntegerField()

    month = models.PositiveSmallIntegerField()

    from_member = models.ForeignKey(
        Member,
        on_delete=models.PROTECT,
        related_name="settlement_payments_sent",
    )

    to_member = models.ForeignKey(
        Member,
        on_delete=models.PROTECT,
        related_name="settlement_payments_received",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    is_paid = models.BooleanField(
        default=False,
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "year",
                    "month",
                    "from_member",
                    "to_member",
                ],
                name="unique_monthly_settlement",
            ),
        ]

        ordering = [
            "-year",
            "-month",
        ]

    def __str__(self):
        return (
            f"{self.from_member.name} → "
            f"{self.to_member.name} - "
            f"৳{self.amount}"
        )