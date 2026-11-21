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


class AdminUserProfileSerializer(UserProfileSerializer):
    class Meta(UserProfileSerializer.Meta):
        read_only_fields = (*UserProfileSerializer.Meta.read_only_fields,
                            'admin_role', 'is_staff', 'is_superuser', 'is_active', 'last_login',
                            *[field.name for field in User._meta.fields if field.name.startswith('perm_')])


class UpdateOwnProfileSerializer(UserProfileSerializer):
    class Meta(UserProfileSerializer.Meta):
        exclude = None
        fields = (
            'first_name', 'last_name', 'father_name', 'national_code', 'birth_date', 'gender',
            'marital_status', 'phone', 'address', 'emergency_name', 'emergency_phone',
            'emergency_relation', 'university', 'education_level', 'student_status',
            'passport_number', 'passport_expiry', 'has_disease', 'disease_description',
            'has_asthma', 'has_allergy', 'allergy_description', 'military_status',
            'profile_image', 'national_card_image', 'student_card_image', 'passport_image',
        )
        read_only_fields = ()


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
