from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('mobile', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password', 'groups', 'user_permissions')
        read_only_fields = ('mobile', 'user_type', 'status', 'date_joined')


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'mobile', 'first_name', 'last_name', 'national_code', 'user_type', 'status', 'profile_image', 'date_joined')


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('رمز عبور فعلی اشتباه است')
        return value


class SearchUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'national_code', 'profile_image', 'mobile')

class AdminUserPermissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'admin_role', 'perm_users', 'perm_trips', 'perm_registrations',
            'perm_attendance', 'perm_financial', 'perm_shop', 'perm_content',
            'perm_tickets', 'perm_announcements', 'perm_sms',
        )
        read_only_fields = ('id',)