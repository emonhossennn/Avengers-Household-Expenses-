from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MealCountView, MemberViewSet


router = DefaultRouter()

router.register(
    r"members",
    MemberViewSet,
    basename="member",
)

urlpatterns = router.urls + [
    path("members/meals/", MealCountView.as_view(), name="meal-counts"),
]