from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from .managers import UserManager

class User(AbstractUser):
    username = models.CharField(max_length=30, primary_key=True)
    first_name = models.CharField(max_length=30, blank=False)
    last_name = models.CharField(max_length=30, blank=False)
    email = models.EmailField(unique=True)
    objects = UserManager()
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    def __str__(self):
        return self.username

class Category(models.Model):
    """
    Represents a spending category (e.g., Food) or subcategory (e.g., Groceries under Food).
    """
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name="subcategories")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'parent', 'user'], name='name_parent_user_unique')
        ]

    def clean(self):
        """
        Ensure that the parent category cannot itself have a parent (i.e., two levels max).
        """
        if self.parent and self.parent.parent:
            raise ValidationError("A subcategory cannot have its own subcategories.")
        if self.parent is None:
            return

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} -> {self.name}"  # e.g., "Food -> Groceries"
        return self.name

class Spending(models.Model):
    """
    Represents a spending transaction.
    """
    description = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=100, help_text="Full name as it appears on the receipt (e.g., 'Opos Uber *Eats Pending Uber.com').")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="spendings")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="spendings")

    def display_category(self):
        """
        Returns a tuple (category_name, subcategory_name).
        If there is no subcategory, the category name is used for both.
        """
        if self.category and self.category.parent:
            return (self.category.parent.name, self.category.name)  # (Category, Subcategory)
        elif self.category:
            return (self.category.name, self.category.name)  # (Category, Category)
        return ("Uncategorized", "Uncategorized")
    
    def save(self, *args, **kwargs):
        """
        Override save to set description to name if description is empty.
        """
        if not self.description:
            self.description = self.name
        super().save(*args, **kwargs)

    def __str__(self):
        category_display = " -> ".join(self.display_category())
        return f"{self.description} - ${self.amount} on {self.date} ({category_display})"
    
class Receipt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="receipts")
    image = models.ImageField(upload_to='receipts/')
    created_at = models.DateTimeField(auto_now_add=True)

    # Future fields for ML parsing results
    parsed_text = models.TextField(blank=True, null=True)
    # e.g., predicted_category = models.ForeignKey(Category, ...)

    def __str__(self):
        return f"Receipt {self.id} for {self.user.username}"