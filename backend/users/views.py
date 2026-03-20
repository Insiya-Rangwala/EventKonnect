import os
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from .serializers import UserSerializer, RegisterSerializer, CollegeSerializer
from .permissions import IsAdmin
from .models import College
from rest_framework.authtoken.models import Token
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests

User = get_user_model()

# Get CSRF Token
@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request):
        return Response({'success': 'CSRF cookie set'})

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        admin_code = request.data.get('admin_code', '')
        secret = os.environ.get('ADMIN_SECRET_CODE', '')

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        # Override role to admin if correct secret code is provided
        data = request.data.copy()
        if secret and admin_code == secret:
            data['role'] = 'admin'

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            if secret and admin_code == secret:
                user.is_staff = True
                user.is_superuser = True
                user.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username') # Front end sends email as username often, but let's support both if logic handles it
        password = request.data.get('password')
        
        # Try to find user by email if username looks like email
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except User.DoesNotExist:
                pass # Will fail in authenticate

        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'role': user.role
            })
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        request.user.auth_token.delete() # Delete token on logout
        logout(request)
        return Response({'success': 'Logged out'})

class GoogleLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token_str = request.data.get('token')
        role = request.data.get('role', 'attendee') # Capture preferred role during registration
        
        if not token_str:
            return Response({'error': 'Token required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify the token using Google's official library
            # Replace 'YOUR_GOOGLE_CLIENT_ID' with the actual client ID provided by the user later
            idinfo = id_token.verify_oauth2_token(token_str, requests.Request(), 'YOUR_GOOGLE_CLIENT_ID')

            # Extract user information from the verified payload
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            
            if not email:
                return Response({'error': 'No email found in Google token'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user exists, if not, create them
            user, created = User.objects.get_or_create(email=email, defaults={
                'username': email,
                'first_name': name.split(' ')[0] if name else '',
                'last_name': ' '.join(name.split(' ')[1:]) if name and ' ' in name else '',
                'role': role
            })
            
            if created:
                user.set_unusable_password()
                user.save()

            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'role': user.role
            })

        except ValueError as e:
            # Invalid token
            print("Token verification failed:", e)
            return Response({'error': 'Invalid Google Token'}, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            # Mock sending email
            reset_token = str(uuid.uuid4())
            print(f"==========================================")
            print(f"PASSWORD RESET LINK FOR {email}:")
            print(f"http://localhost:5173/reset-password?token={reset_token}&email={email}")
            print(f"==========================================")
            return Response({'success': 'Password reset link sent to email'})
        except User.DoesNotExist:
            # Don't reveal user existence
            return Response({'success': 'Password reset link sent to email'})

class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        # In real app, verify token. Here we believe the email.
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            return Response({'success': 'Password reset successfully'})
        except User.DoesNotExist:
             return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ChangePasswordView(APIView):
    # Logged in users
    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        user = request.user
        
        if not user.check_password(old_password):
            return Response({'error': 'Incorrect old password'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({'success': 'Password changed successfully'})

class ManageUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

class VerifyUserView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_verified = True
            user.save()
            return Response({'status': 'verified'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)




class AdminUserStatusView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Prevent blocking oneself
            if user == request.user:
                 return Response({'error': 'Cannot block yourself'}, status=status.HTTP_400_BAD_REQUEST)
            
            is_active = request.data.get('is_active')
            if is_active is not None:
                user.is_active = is_active
                user.save()
                # If blocking, we might want to delete auth tokens to force logout
                if is_active is False:
                    Token.objects.filter(user=user).delete()
                
                status_text = "unblocked" if is_active else "blocked"
                return Response({'status': 'success', 'message': f'User {status_text} successfully'})
            return Response({'error': 'is_active field required'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminUserRoleView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user == request.user:
                 return Response({'error': 'Cannot change your own role'}, status=status.HTTP_400_BAD_REQUEST)

            new_role = request.data.get('role')
            if new_role not in ['admin', 'organizer', 'attendee']:
                return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.role = new_role
            user.save()
            return Response({'status': 'success', 'message': f'User role updated to {new_role}'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class CollegeListCreateView(generics.ListCreateAPIView):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.AllowAny()]

class CollegeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [IsAdmin]
