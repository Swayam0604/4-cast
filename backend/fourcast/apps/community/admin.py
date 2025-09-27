from django.contrib import admin
from .models import CommunityPost, PostComment, PostVote

@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'post_type', 'location', 'is_verified', 'upvotes', 'created_at']
    list_filter = ['post_type', 'is_verified', 'created_at']
    search_fields = ['title', 'user__username', 'location', 'content']
    ordering = ['-created_at']
    
    # Allow admin to verify posts
    actions = ['mark_as_verified', 'mark_as_unverified']
    
    def mark_as_verified(self, request, queryset):
        queryset.update(is_verified=True)
    mark_as_verified.short_description = "Mark selected posts as verified"
    
    def mark_as_unverified(self, request, queryset):
        queryset.update(is_verified=False)
    mark_as_unverified.short_description = "Mark selected posts as unverified"

@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'post__title', 'content']
    ordering = ['-created_at']

@admin.register(PostVote)
class PostVoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'vote_type', 'created_at']
    list_filter = ['vote_type', 'created_at']
    search_fields = ['user__username', 'post__title']
