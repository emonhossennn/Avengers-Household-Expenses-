from django.contrib import admin
from .models import MealCount, Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "hero",
        "theme_color",
    )

    search_fields = (
        "name",
        "hero",
    )


@admin.register(MealCount)
class MealCountAdmin(admin.ModelAdmin):
    list_display = ("member", "year", "month", "meals")
    list_filter = ("year", "month")