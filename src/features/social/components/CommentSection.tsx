import { useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { apiService, ASSET_BASE_URL } from "../../../services/api.service";
import { Avatar } from "../../../components/common/Avatar";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../../context/AuthContext";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await apiService.getComments(postId);
      setComments(data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const result = await apiService.addComment(postId, newComment);
      setComments([...comments, result.comment]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin text-gray-400" size={20} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {comments.map((comment) => {
          const userReaction = comment.reactions?.find(
            (r: any) =>
              r.user === user?.employeeId || r.user?._id === user?.employeeId
          );

          return (
            <div key={comment._id} className="flex gap-2.5 group">
              <Avatar
                src={
                  comment.author?.profilePicture
                    ? `${ASSET_BASE_URL}/${comment.author.profilePicture}`
                    : undefined
                }
                alt={comment.author?.firstName}
                name={`${comment.author?.firstName} ${comment.author?.lastName}`}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-bg-hover rounded-lg p-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-xs text-gray-900 dark:text-text-primary">
                      {comment.author?.firstName} {comment.author?.lastName}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-text-muted">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-text-primary whitespace-pre-wrap leading-tight">
                    {comment.content}
                  </p>
                </div>

                {/* Comment Actions */}
                <div className="flex items-center gap-4 mt-1 ml-1">
                  <button
                    onClick={async () => {
                      try {
                        const result = await apiService.toggleCommentReaction(
                          comment._id,
                          "like"
                        );
                        // Update local state
                        setComments((prev) =>
                          prev.map((c) =>
                            c._id === comment._id
                              ? { ...c, reactions: result.reactions }
                              : c
                          )
                        );
                      } catch (error) {
                        console.error("Failed to react", error);
                      }
                    }}
                    className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                      userReaction
                        ? "text-red-500"
                        : "text-gray-500 dark:text-text-secondary hover:text-gray-700 dark:hover:text-text-primary"
                    }`}
                  >
                    {userReaction ? "Liked" : "Like"}
                    {comment.reactions?.length > 0 && (
                      <span className="bg-gray-100 dark:bg-bg-hover px-1 rounded-full text-[10px]">
                        {comment.reactions.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-2">
            No comments yet. Be the first!
          </p>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar
          src={user?.avatar ? `${ASSET_BASE_URL}/${user.avatar}` : undefined}
          name={user?.name}
          className="w-8 h-8"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-gray-100 dark:bg-bg-hover dark:text-text-primary border-none rounded-full py-2 px-4 pr-10 text-sm focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-50 p-1"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
