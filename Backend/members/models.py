from django.db import models


class HeroChoices(models.TextChoices):

    IRON_MAN = "IRON_MAN", "Iron Man"
    HULK = "HULK", "Hulk"
    THOR = "THOR", "Thor"
    CAPTAIN = "CAPTAIN", "Captain America"


class Member(models.Model):
    name = models.CharField(max_length=50)

    hero = models.CharField(
        max_length=20,
        choices=HeroChoices.choices,
        unique=True,
    )

    theme_color = models.CharField(max_length=20)

    intro_song = models.CharField(
        max_length=255,
        blank=True,
    )

    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} ({self.hero})"


class MealCount(models.Model):
    """Tracks how many meals each member had in a given month."""

    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="meal_counts",
    )

    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField()
    meals = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("member", "year", "month")
        ordering = ["-year", "-month", "member"]

    def __str__(self):
        return f"{self.member.name} — {self.year}/{self.month}: {self.meals} meals"