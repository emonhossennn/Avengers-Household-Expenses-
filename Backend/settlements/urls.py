from django.urls import path

from .views import (
    SettlementSummaryView,
    SettlementPaymentView,
)


urlpatterns = [
    path(
        "settlements/summary/",
        SettlementSummaryView.as_view(),
        name="settlement-summary",
    ),

    path(
        "settlements/payments/",
        SettlementPaymentView.as_view(),
        name="settlement-payments",
    ),
]