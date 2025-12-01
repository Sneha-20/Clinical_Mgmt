from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import User

@receiver(post_save, sender=User)
def notify_admin_on_new_user(sender, instance, created, **kwargs):
    if created and not instance.is_approved:
        # example: email all superusers or users with admin role
        admin_emails = list(User.objects.filter(roles__name='Admin').values_list('email', flat=True))
        print(admin_emails)
        if admin_emails:
            send_mail(
                subject="New user awaiting approval",
                message=f"User {instance.email} registered and needs approval.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=admin_emails,
                fail_silently=True,
            )

# track approval change to notify user
@receiver(pre_save, sender=User)
def detect_approval_change(sender, instance, **kwargs):
    if not instance.pk:
        instance._was_approved = None
        return
    try:
        prev = User.objects.get(pk=instance.pk)
        instance._was_approved = prev.is_approved
    except User.DoesNotExist:
        instance._was_approved = None

@receiver(post_save, sender=User)
def notify_user_on_approval(sender, instance, created, **kwargs):
    if created:
        return
    was = getattr(instance, "_was_approved", None)
    if was is False and instance.is_approved is True:
        # send approval email to user
        send_mail(
            subject="Your account has been approved",
            message="Your account has been approved by admin. You can now log in.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
            fail_silently=True,
        )
    if was is False and instance.is_approved is False and not instance.is_active:
        # optional: rejection flow (if you set is_active False to reject)
        pass