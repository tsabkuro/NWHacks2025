from rest_framework import serializers
from .models import Spending, Category, User
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError

class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("A user with this email already exists.")
        return value

    def save(self, request):
        # Create the user via the parent class
        user = super().save(request)
        user.first_name = self.validated_data.get('first_name', '')
        user.last_name = self.validated_data.get('last_name', '')
        user.save()

        # Auto-create default categories
        default_categories = [
            "Food",
            "Housing",
            "Insurance",
            "Gifts",
            "Travel",
            "Clothing",
            "Debt",
            "Other",
        ]
        for cat_name in default_categories:
            Category.objects.create(name=cat_name, user=user)

        return user

class CategorySerializer(serializers.ModelSerializer):
    # Override how DRF handles `parent` so we only look up categories owned by the current user. Also allow `null` as a valid parent.
    parent = serializers.PrimaryKeyRelatedField(queryset=Category.objects.none(), required=False, allow_null=True)
    parent_name = serializers.ReadOnlyField(source="parent.name", default=None)

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'parent_name', 'user']
        read_only_fields = ['id', 'user']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['parent'].queryset = Category.objects.filter(user=request.user)

    def validate_parent(self, value):
        if self.instance and value and self.instance.pk == value.pk:
            raise ValidationError("A category cannot be its own parent.")
        return value

    def validate(self, attrs):
        parent = attrs.get('parent')
        name = attrs.get('name', getattr(self.instance, 'name', None))
        user = self.context['request'].user
        qs = Category.objects.filter(name=name, parent=parent, user=user)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)  # exclude self if update
        if qs.exists():
            raise ValidationError("A category with this name already exists.")
        if parent and parent.user != user:
            raise ValidationError("The parent category must belong to the same user.")
        if parent and parent.parent:
            raise ValidationError("Cannot make a sub-category of a sub-category.")
        qs = Category.objects.filter(name=name, parent=parent, user=user)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError("A category with this name already exists for you.")
        if self.instance and self.instance.subcategories.exists() and parent:
            raise ValidationError("A category with subcategories cannot be made a subcategory.")
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        print("DEBUG: creating category for user:", self.context['request'].user)
        return super().create(validated_data)


class SpendingSerializer(serializers.ModelSerializer):
    """
    Serializer for Spending model. 
    Ensures:
      - Only categories belonging to the user can be used
      - category can be null (Uncategorized)
      - description defaults to name if not provided
    """

    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(),
        required=False,
        allow_null=True
    )
    category_name = serializers.ReadOnlyField(source='category.name', default=None)

    class Meta:
        model = Spending
        fields = ['id', 'description', 'name', 'amount', 'date', 'category', 'category_name', 'user']
        read_only_fields = ['id', 'user', 'category_name']

    def __init__(self, *args, **kwargs):
        """Dynamically restrict 'category' choices to the current user's categories."""
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['category'].queryset = Category.objects.filter(user=request.user)

    def validate_category(self, value):
        if value and value.user != self.context['request'].user:
            raise ValidationError("The selected category does not belong to the authenticated user.")
        return value

    def create(self, validated_data):
        """
        Assign the spending to the current user and handle default description if empty.
        """
        validated_data['user'] = self.context['request'].user
        if not validated_data.get('description'):
            validated_data['description'] = validated_data.get('name', '')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        return super().update(instance, validated_data)