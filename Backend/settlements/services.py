from decimal import Decimal

from expenses.services import get_monthly_summary


def calculate_settlements(year: int, month: int):
    """
    Calculate the minimum practical set of money transfers
    required to settle a month's shared expenses.

    Positive balance = member should receive money.
    Negative balance = member needs to pay money.
    """

    summary = get_monthly_summary(
        year=year,
        month=month,
    )

    creditors = []
    debtors = []

    for member in summary["members"]:
        balance = Decimal(member["balance"])

        if balance > Decimal("0.00"):
            creditors.append(
                {
                    "member_id": member["member_id"],
                    "name": member["name"],
                    "amount": balance,
                }
            )

        elif balance < Decimal("0.00"):
            debtors.append(
                {
                    "member_id": member["member_id"],
                    "name": member["name"],
                    "amount": abs(balance),
                }
            )

    # Largest balances first.
    creditors.sort(
        key=lambda item: item["amount"],
        reverse=True,
    )

    debtors.sort(
        key=lambda item: item["amount"],
        reverse=True,
    )

    settlements = []

    creditor_index = 0
    debtor_index = 0

    while (
        creditor_index < len(creditors)
        and debtor_index < len(debtors)
    ):
        creditor = creditors[creditor_index]
        debtor = debtors[debtor_index]

        transfer_amount = min(
            creditor["amount"],
            debtor["amount"],
        )

        transfer_amount = transfer_amount.quantize(
            Decimal("0.01")
        )

        if transfer_amount > Decimal("0.00"):
            settlements.append(
                {
                    "from_member_id": debtor["member_id"],
                    "from_member": debtor["name"],
                    "to_member_id": creditor["member_id"],
                    "to_member": creditor["name"],
                    "amount": transfer_amount,
                }
            )

        creditor["amount"] -= transfer_amount
        debtor["amount"] -= transfer_amount

        creditor["amount"] = creditor["amount"].quantize(
            Decimal("0.01")
        )

        debtor["amount"] = debtor["amount"].quantize(
            Decimal("0.01")
        )

        if creditor["amount"] == Decimal("0.00"):
            creditor_index += 1

        if debtor["amount"] == Decimal("0.00"):
            debtor_index += 1

    return {
        "year": year,
        "month": month,
        "settlements": settlements,
    }