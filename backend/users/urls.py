from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, UserProfileView, GetCSRFToken, 
    VerifyUserView, ManageUsersView, GoogleLoginView, ForgotPasswordView, 
    ResetPasswordView, ChangePasswordView, AdminUserStatusView, AdminUserRoleView,
    CollegeListCreateView, CollegeDetailView
)

urlpatterns = [
    path('csrf/', GetCSRFToken.as_view(), name='csrf_cookie'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('manage/', ManageUsersView.as_view(), name='manage_users'),
    path('verify/<int:pk>/', VerifyUserView.as_view(), name='verify_user'),
    path('status/<int:pk>/', AdminUserStatusView.as_view(), name='user_status'),
    path('role/<int:pk>/', AdminUserRoleView.as_view(), name='user_role'),
    path('colleges/', CollegeListCreateView.as_view(), name='college_list_create'),
    path('colleges/<int:pk>/', CollegeDetailView.as_view(), name='college_detail'),
]
