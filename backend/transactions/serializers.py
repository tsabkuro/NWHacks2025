from rest_framework import serializers
from .models import Spending, Category, User
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError

class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def validate_email(self, value):
        """
        Check that the email is unique.
        """
        if User.objects.filter(email=value).exists():
            raise ValidationError("A user with this email already exists.")
        return value

    def save(self, request):
        user = super().save(request)
        user.first_name = self.validated_data.get('first_name', '')
        user.last_name = self.validated_data.get('last_name', '')
        user.save()
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
    category_name = serializers.ReadOnlyField(source='category.name', default=None)

    class Meta:
        model = Spending
        fields = ['id', 'description', 'name', 'amount', 'date', 'category', 'category_name', 'user']
        read_only_fields = ['id', 'user', 'category_name']

    def validate_category(self, value):
        if value and value.user != self.context['request'].user:
            raise ValidationError("The selected category does not belong to the authenticated user.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)