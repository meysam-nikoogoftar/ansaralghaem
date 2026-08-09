from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Reaction, Comment, LoveWall, Poll, PollOption, PollVote, TripTimeline, Badge, UserBadge, PilgrimLocation
from .serializers import (
    ReactionSerializer, CommentSerializer, LoveWallSerializer,
    PollSerializer, PollVoteSerializer, TripTimelineSerializer,
    BadgeSerializer, UserBadgeSerializer, PilgrimLocationSerializer
)


class ReactView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content_type = request.data.get('content_type')
        content_id = request.data.get('content_id')
        reaction_type = request.data.get('reaction_type')

        existing = Reaction.objects.filter(
            user=request.user,
            content_type=content_type,
            content_id=content_id
        ).first()

        if existing:
            if existing.reaction_type == reaction_type:
                existing.delete()
                return Response({'message': 'ریکشن حذف شد'})
            else:
                existing.reaction_type = reaction_type
                existing.save()
                return Response(ReactionSerializer(existing).data)

        reaction = Reaction.objects.create(
            user=request.user,
            content_type=content_type,
            content_id=content_id,
            reaction_type=reaction_type
        )
        return Response(ReactionSerializer(reaction).data, status=status.HTTP_201_CREATED)


class ContentReactionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, content_type, content_id):
        reactions = Reaction.objects.filter(content_type=content_type, content_id=content_id)
        result = {}
        for reaction_type, _ in Reaction.REACTION_TYPE_CHOICES:
            result[reaction_type] = reactions.filter(reaction_type=reaction_type).count()
        return Response(result)


class CommentListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CommentSerializer

    def get_queryset(self):
        content_type = self.request.query_params.get('content_type', '')
        content_id = self.request.query_params.get('content_id', '')
        return Comment.objects.filter(
            content_type=content_type,
            content_id=content_id,
            status='approved',
            parent=None
        )


class CreateCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoveWallListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoveWallSerializer
    queryset = LoveWall.objects.all()


class CreateLoveWallView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LoveWallSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActivePollView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.utils import timezone
        now = timezone.now()
        poll = Poll.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).first()
        if poll:
            return Response(PollSerializer(poll).data)
        return Response({'message': 'نظرسنجی فعالی وجود ندارد'})


class VotePollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        option_id = request.data.get('option_id')
        try:
            option = PollOption.objects.get(pk=option_id)
            if PollVote.objects.filter(user=request.user, option__poll=option.poll).exists():
                return Response({'error': 'قبلاً رای داده‌اید'}, status=status.HTTP_400_BAD_REQUEST)
            vote = PollVote.objects.create(user=request.user, option=option)
            return Response(PollVoteSerializer(vote).data, status=status.HTTP_201_CREATED)
        except PollOption.DoesNotExist:
            return Response({'error': 'گزینه یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class TripTimelineListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TripTimelineSerializer

    def get_queryset(self):
        trip_id = self.request.query_params.get('trip_id', '')
        if trip_id:
            return TripTimeline.objects.filter(trip_id=trip_id)
        return TripTimeline.objects.all()


class CreateTripTimelineView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TripTimelineSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyBadgesView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserBadgeSerializer

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user)


class PilgrimLocationListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PilgrimLocationSerializer
    queryset = PilgrimLocation.objects.all()


class CreatePilgrimLocationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PilgrimLocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)