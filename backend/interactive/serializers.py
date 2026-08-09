from rest_framework import serializers
from .models import Reaction, Comment, LoveWall, Poll, PollOption, PollVote, TripTimeline, Badge, UserBadge, PilgrimLocation


class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_image = serializers.ImageField(source='user.profile_image', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at')

    def get_replies(self, obj):
        if obj.parent is None:
            replies = Comment.objects.filter(parent=obj, status='approved')
            return CommentSerializer(replies, many=True).data
        return []


class LoveWallSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_image = serializers.ImageField(source='user.profile_image', read_only=True)
    reactions_count = serializers.SerializerMethodField()

    class Meta:
        model = LoveWall
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

    def get_reactions_count(self, obj):
        from .models import Reaction
        return Reaction.objects.filter(content_type='lovewall', content_id=obj.id).count()


class PollOptionSerializer(serializers.ModelSerializer):
    votes_count = serializers.SerializerMethodField()

    class Meta:
        model = PollOption
        fields = '__all__'

    def get_votes_count(self, obj):
        return obj.votes.count()


class PollSerializer(serializers.ModelSerializer):
    options = PollOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Poll
        fields = '__all__'


class PollVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollVote
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class TripTimelineSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = TripTimeline
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UserBadgeSerializer(serializers.ModelSerializer):
    badge_detail = BadgeSerializer(source='badge', read_only=True)

    class Meta:
        model = UserBadge
        fields = '__all__'


class PilgrimLocationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = PilgrimLocation
        fields = '__all__'
        read_only_fields = ('user', 'recorded_at')