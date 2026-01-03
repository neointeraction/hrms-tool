import { useState, useEffect } from "react";
import { Skeleton } from "../../components/common/Skeleton";
import { apiService } from "../../services/api.service";
import PostCard from "./components/PostCard";
import CreatePost from "./components/CreatePost";
import { useNotification } from "../../context/NotificationContext";

export default function SocialFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // New state for pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { clearSocialNotifications } = useNotification();

  useEffect(() => {
    clearSocialNotifications();
    fetchFeed();
  }, []); // Initial load

  const fetchFeed = async (pageNum = 1) => {
    try {
      if (pageNum > 1) setLoadingMore(true);

      const data = await apiService.getSocialFeed({ page: pageNum, limit: 10 });

      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => {
          // Prevent duplicates
          const existingIds = new Set(prev.map((p) => p._id));
          const newUniquePosts = data.posts.filter(
            (p: any) => !existingIds.has(p._id)
          );
          return [...prev, ...newUniquePosts];
        });
      }

      setHasMore(data.currentPage < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to load feed", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore) {
      fetchFeed(page + 1);
    }
  };

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdate = (updatedPost: any) => {
    setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handlePostDelete = (postId: string) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  if (loading && page === 1) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />{" "}
        {/* Create Post Skeleton */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-bg-card rounded-xl border border-gray-200 dark:border-border p-4 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <CreatePost onPostCreated={handlePostCreated} />
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onPostUpdate={handlePostUpdate}
            onDelete={handlePostDelete}
          />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-16 bg-white/50 dark:bg-bg-card/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-border backdrop-blur-sm">
          <div className="max-w-xs mx-auto space-y-3">
            <p className="text-lg font-medium text-text-primary">
              No posts yet
            </p>
            <p className="text-text-secondary">
              Be the first to share something with your team!
            </p>
          </div>
        </div>
      )}

      {hasMore && posts.length > 0 && (
        <div className="mt-10 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-white dark:bg-bg-card border border-border shadow-sm rounded-full text-brand-primary font-medium text-sm hover:bg-gray-50 dark:hover:bg-bg-hover transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              "Load more posts"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
