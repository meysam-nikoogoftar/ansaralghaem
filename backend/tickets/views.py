from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Ticket, TicketMessage
from .serializers import TicketSerializer, CreateTicketSerializer, TicketMessageSerializer


class MyTicketsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user)


class CreateTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateTicketSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            ticket = serializer.save()
            return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user)


class ReplyTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk, user=request.user)
            if ticket.status == 'closed':
                return Response(
                    {'error': 'این تیکت بسته شده است'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            text = request.data.get('text')
            if not text:
                return Response(
                    {'error': 'متن پیام الزامی است'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            message = TicketMessage.objects.create(
                ticket=ticket,
                sender=request.user,
                text=text
            )
            ticket.status = 'pending'
            ticket.save()
            return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        except Ticket.DoesNotExist:
            return Response({'error': 'تیکت یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class AllTicketsView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = TicketSerializer

    def get_queryset(self):
        queryset = Ticket.objects.all()
        ticket_status = self.request.query_params.get('status', '')
        if ticket_status:
            queryset = queryset.filter(status=ticket_status)
        return queryset


class AdminReplyTicketView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
            text = request.data.get('text')
            if not text:
                return Response(
                    {'error': 'متن پیام الزامی است'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            message = TicketMessage.objects.create(
                ticket=ticket,
                sender=request.user,
                text=text
            )
            ticket.status = 'answered'
            ticket.save()
            return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        except Ticket.DoesNotExist:
            return Response({'error': 'تیکت یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class CloseTicketView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
            ticket.status = 'closed'
            ticket.save()
            return Response({'message': 'تیکت بسته شد'})
        except Ticket.DoesNotExist:
            return Response({'error': 'تیکت یافت نشد'}, status=status.HTTP_404_NOT_FOUND)