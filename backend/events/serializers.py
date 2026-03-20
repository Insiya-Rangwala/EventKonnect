from rest_framework import serializers
from .models import Event, MemoryBook, MemoryComment

class MemoryBookSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.first_name')
    class Meta:
        model = MemoryBook
        fields = '__all__'

class MemoryCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.first_name')
    class Meta:
        model = MemoryComment
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.SerializerMethodField()
    memory_books = MemoryBookSerializer(many=True, read_only=True)
    memory_comments = MemoryCommentSerializer(many=True, read_only=True)
    seats_left = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'image', 'category', 
                  'venue', 'location_lat', 'location_lng', 'capacity', 
                  'organizer', 'organizer_name', 'college_mode',
                  'visibility', 'college',
                  'status', 'created_at', 'memory_books', 'memory_comments', 'seats_left', 'is_registered']
        read_only_fields = ['organizer', 'status', 'created_at']

    def get_seats_left(self, obj):
        booked_count = obj.tickets.exclude(status='cancelled').count()
        return max(0, obj.capacity - booked_count)

    def get_organizer_name(self, obj):
        user = obj.organizer
        if hasattr(user, 'organizer_profile') and user.organizer_profile.organization_name:
            return user.organizer_profile.organization_name
        name = f"{user.first_name} {user.last_name}".strip()
        return name if name else user.username

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.tickets.filter(attendee=request.user).exclude(status='cancelled').exists()
        return False

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['organizer'] = user
        return super().create(validated_data)
