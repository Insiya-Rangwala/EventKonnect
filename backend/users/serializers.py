from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import College
from core.models import SystemSettings
import requests
from django.core.files.base import ContentFile

User = get_user_model()

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['id', 'name', 'email_domain']

class UserSerializer(serializers.ModelSerializer):
    # Dynamic fields based on role
    profile = serializers.SerializerMethodField()
    # Write-only fields for updating nested profile data
    organization_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    college_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    contact_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    avatar_url = serializers.URLField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name', 'profile_picture', 'profile', 'is_active',
                  'organization_name', 'college_name', 'contact_number', 'college', 'is_college_verified', 'avatar_url']
        read_only_fields = ['email', 'role', 'is_active', 'is_college_verified']

    def get_profile(self, obj):
        try:
            if obj.role == User.ADMIN and hasattr(obj, 'admin_profile'):
                return {'access_level': obj.admin_profile.access_level}
            elif obj.role == User.ORGANIZER and hasattr(obj, 'organizer_profile'):
                return {
                    'organization_name': obj.organizer_profile.organization_name,
                    'contact_number': obj.organizer_profile.contact_number,
                    'is_verified': obj.organizer_profile.is_verified
                }
            elif obj.role == User.ATTENDEE and hasattr(obj, 'attendee_profile'):
                return {
                    'college_name': obj.attendee_profile.college_name,
                    'registered_events_count': obj.attendee_profile.registered_events_count
                }
        except Exception:
            return None
        return None

    def update(self, instance, validated_data):
        # Pop nested profile fields
        org_name = validated_data.pop('organization_name', None)
        college = validated_data.pop('college_name', None)
        contact = validated_data.pop('contact_number', None)
        avatar_url = validated_data.pop('avatar_url', None)

        if avatar_url:
            try:
                response = requests.get(avatar_url, timeout=5)
                if response.status_code == 200:
                    ext = avatar_url.split('?')[0].split('.')[-1]
                    if ext.lower() not in ['gif', 'png', 'jpg', 'jpeg']:
                        ext = 'gif'
                    instance.profile_picture.save(f"avatar_{instance.id}.{ext}", ContentFile(response.content), save=False)
            except Exception:
                pass

        # Update User fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        # Update nested profile
        if instance.role == User.ORGANIZER and hasattr(instance, 'organizer_profile'):
            if org_name is not None:
                instance.organizer_profile.organization_name = org_name
            if contact is not None:
                instance.organizer_profile.contact_number = contact
            instance.organizer_profile.save()
        elif instance.role == User.ATTENDEE and hasattr(instance, 'attendee_profile'):
            if college is not None:
                instance.attendee_profile.college_name = college
            instance.attendee_profile.save()

        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # Optional profile fields to accept during registration
    organization_name = serializers.CharField(required=False, allow_blank=True)
    college_name = serializers.CharField(required=False, allow_blank=True)
    college_id = serializers.IntegerField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'first_name', 'last_name', 'organization_name', 'college_name', 'college_id']

    def create(self, validated_data):
        # Extract profile data
        org_name = validated_data.pop('organization_name', '')
        college_name = validated_data.pop('college_name', '')
        college_id = validated_data.pop('college_id', None)
        
        email = validated_data.get('email', '')
        role = validated_data.get('role', User.ATTENDEE)
        
        is_college_verified = False
        college_instance = None
        
        settings = SystemSettings.load()
        if role == User.ATTENDEE:
            if college_id:
                try:
                    college_instance = College.objects.get(id=college_id)
                    domain = email.split('@')[-1] if '@' in email else ''
                    if domain == college_instance.email_domain:
                        is_college_verified = True
                    else:
                        raise serializers.ValidationError({"email": f"Email domain must be @{college_instance.email_domain} for {college_instance.name}."})
                except College.DoesNotExist:
                    raise serializers.ValidationError({"college_id": "Selected college does not exist."})
            elif settings.college_mode:
                raise serializers.ValidationError({"college_id": "College selection is required when College Mode is active."})

        user = User.objects.create_user(
            username=validated_data['username'],
            email=email,
            password=validated_data['password'],
            role=role,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            college=college_instance,
            is_college_verified=is_college_verified
        )

        # Update the automatically created profile (from signal)
        if user.role == User.ORGANIZER and hasattr(user, 'organizer_profile'):
            user.organizer_profile.organization_name = org_name
            user.organizer_profile.save()
        elif user.role == User.ATTENDEE and hasattr(user, 'attendee_profile'):
            user.attendee_profile.college_name = college_name
            user.attendee_profile.save()
            
        return user
