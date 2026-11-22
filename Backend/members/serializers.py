from rest_framework import serializers

from .models import MealCount, Member


class MemberSerializer(serializers.ModelSerializer):
    hero_display = serializers.CharField(
        source="get_hero_display",
        read_only=True,
    )

    class Meta:
        model = Member
        fields = [
            "id",
            "name",
            "hero",
            "hero_display",
            "theme_color",
            "intro_song",
            "avatar",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "hero",
            "hero_display",
            "theme_color",
            "intro_song",
            "avatar",
            "created_at",
        ]


class MealCountSerializer(serializers.ModelSerializer):
    member_id = serializers.IntegerField(source="member.id", read_only=True)
    member_name = serializers.CharField(source="member.name", read_only=True)
    hero = serializers.CharField(source="member.hero", read_only=True)

    class Meta:
        model = MealCount
        fields = [
            "id",
            "member_id",
            "member_name",
            "hero",
            "year",
            "month",
            "meals",
        ]