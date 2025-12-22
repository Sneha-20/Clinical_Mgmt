import boto3
import uuid
from django.conf import settings


def upload_file_to_s3(uploaded_file, file_type):
    """Upload file to S3 and return the URL"""
    # Generate unique filename
    file_extension = uploaded_file.name.split('.')[-1]
    unique_filename = f"test_reports/{file_type}/{uuid.uuid4()}.{file_extension}"
    
    # Initialize S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )
    
    # Upload to S3
    s3_client.upload_fileobj(
        uploaded_file,
        settings.AWS_STORAGE_BUCKET_NAME,
        unique_filename,
        ExtraArgs={
            'ContentType': uploaded_file.content_type,
            # 'ACL': 'public-read'
        }
    )
    
    # Generate S3 URL
    file_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{unique_filename}"
    return file_url
