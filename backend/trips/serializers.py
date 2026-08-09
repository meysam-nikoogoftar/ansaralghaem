from rest_framework import serializers
from .models import Trip, Registration, TravelCompanion, AttendancePeriod, AttendanceRecord
from accounts.serializers import SearchUserSerializer


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'


class TravelCompanionSerializer(serializers.ModelSerializer):
    companion_detail = SearchUserSerializer(source='companion', read_only=True)

    class Meta:
        model = TravelCompanion
        fields = ('id', 'companion', 'companion_detail', 'added_at')


class RegistrationSerializer(serializers.ModelSerializer):
    companions = TravelCompanionSerializer(many=True, read_only=True)
    trip_detail = TripSerializer(source='trip', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Registration
        fields = '__all__'
        read_only_fields = ('tracking_code', 'remaining_amount', 'payment_status', 'user')


class CreateRegistrationSerializer(serializers.ModelSerializer):
    companion_national_codes = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = Registration
        fields = ('trip', 'companion_national_codes')

    def create(self, validated_data):
        from accounts.models import User
        companion_codes = validated_data.pop('companion_national_codes', [])
        user = self.context['request'].user
        trip = validated_data['trip']
        registration = Registration.objects.create(
            user=user,
            trip=trip,
            total_cost=trip.cost,
            remaining_amount=trip.cost
        )
        for code in companion_codes:
            try:
                companion = User.objects.get(national_code=code)
                TravelCompanion.objects.create(
                    registration=registration,
                    companion=companion
                )
            except User.DoesNotExist:
                pass
        return registration


class AttendancePeriodSerializer(serializers.ModelSerializer):
    present_count = serializers.SerializerMethodField()
    absent_count = serializers.SerializerMethodField()

    class Meta:
        model = AttendancePeriod
        fields = '__all__'

    def get_present_count(self, obj):
        return obj.records.filter(is_present=True).count()

    def get_absent_count(self, obj):
        return obj.records.filter(is_present=False).count()


class AttendanceRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_image = serializers.ImageField(source='user.profile_image', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'