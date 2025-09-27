from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CommunityPost(models.Model):
    """Community posts about local weather conditions"""
    POST_TYPES = [
        ('warning', 'Weather Warning'),
        ('help', 'Help Needed'),
        ('info', 'Local Information'),
        ('safe', 'Safety Update'),
        ('resolved', 'Situation Resolved'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_posts')
    title = models.CharField(max_length=200)
    content = models.TextField(max_length=1000)
    post_type = models.CharField(max_length=20, choices=POST_TYPES)
    location = models.CharField(max_length=100)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)  # Admin verification
    upvotes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.location} - {self.user.username}"

class PostComment(models.Model):
    """Comments on community posts"""
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.title}"

class PostVote(models.Model):
    """User votes on posts"""
    VOTE_TYPES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='votes')
    vote_type = models.CharField(max_length=10, choices=VOTE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'post']  # One vote per user per post

    def __str__(self):
        return f"{self.user.username} - {self.vote_type} - {self.post.title}"
