from rest_framework import serializers
from .models import Ticket, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_image = serializers.ImageField(source='sender.profile_image', read_only=True)

    class Meta:
        model = TicketMessage
        fields = '__all__'
        read_only_fields = ('sender', 'created_at')


class TicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at')


class CreateTicketSerializer(serializers.ModelSerializer):
    first_message = serializers.CharField(write_only=True)

    class Meta:
        model = Ticket
        fields = ('title', 'priority', 'attachment', 'first_message')

    def create(self, validated_data):
        first_message = validated_data.pop('first_message')
        user = self.context['request'].user
        ticket = Ticket.objects.create(user=user, **validated_data)
        TicketMessage.objects.create(
            ticket=ticket,
            sender=user,
            text=first_message
        )
        return ticket