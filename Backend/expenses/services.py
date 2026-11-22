
from calendar import monthrange
from datetime import date
from decimal import Decimal

from django.db.models import Sum

from members.models import Member

from .models import Expense


def get_monthly_summary(year: int, month: int):
    """
    Calculate the monthly expense summary for all house members.

    Args:
        year: Four-digit year, e.g. 2026.
        month: Month number, 1-12.

    Returns:
        Dictionary containing:
        - total expenses
        - equal share per member
        - each member's contribution
        - each member's balance
    """

    # Validate month
    if month < 1 or month > 12:
        raise ValueError("Month must be between 1 and 12.")

    # Validate year
    if year < 2000 or year > 2100:
        raise ValueError("Invalid year.")

    start_date = date(year, month, 1)

    last_day = monthrange(year, month)[1]

    end_date = date(year, month, last_day)

    members = list(
        Member.objects.all().order_by("id")
    )

    expenses = (
        Expense.objects
        .filter(
            expense_date__gte=start_date,
            expense_date__lte=end_date,
        )
        .select_related("paid_by")
    )

    total_expense = (
        expenses.aggregate(
            total=Sum("amount")
        )["total"]
        or Decimal("0.00")
    )

    member_count = len(members)

    if member_count == 0:
        return {
            "year": year,
            "month": month,
            "total_expense": Decimal("0.00"),
            "member_share": Decimal("0.00"),
            "members": [],
        }

    member_share = (
        total_expense / Decimal(member_count)
    ).quantize(Decimal("0.01"))

    paid_by_member = {
        member.id: Decimal("0.00")
        for member in members
    }

    for expense in expenses:
        paid_by_member[expense.paid_by_id] += expense.amount

    member_summaries = []

    for member in members:
        paid = paid_by_member[member.id]

        balance = (
            paid - member_share
        ).quantize(Decimal("0.01"))

        member_summaries.append(
            {
                "member_id": member.id,
                "name": member.name,
                "hero": member.hero,
                "paid": paid.quantize(Decimal("0.01")),
                "share": member_share,
                "balance": balance,
            }
        )

    return {
        "year": year,
        "month": month,
        "total_expense": total_expense.quantize(
            Decimal("0.01")
        ),
        "member_share": member_share,
        "members": member_summaries,
    }

