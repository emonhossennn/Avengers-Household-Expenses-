from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MealCountView, MemberViewSet


router = DefaultRouter()

router.register(
    r"members",
    MemberViewSet,
    basename="member",
)

# ⚠️ meals/ MUST come before router.urls
# otherwise the router's members/{pk}/ pattern swallows it
urlpatterns = [
    path("members/meals/", MealCountView.as_view(), name="meal-counts"),
] + router.urls