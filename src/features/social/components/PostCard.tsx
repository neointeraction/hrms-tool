import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreVertical } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiService, ASSET_BASE_URL } from "../../../services/api.service";
import { Avatar } from "../../../components/common/Avatar";
import CommentSection from "./CommentSection.tsx";
import { ConfirmationModal } from "../../../components/common/ConfirmationModal";

interface PostCardProps {
  post: any;
  onPostUpdate: (updatedPost: any) => void;
  onDelete: (postId: string) => void;
}

export default function PostCard({
  post,
  onPostUpdate,
  onDelete,
}: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await apiService.deletePost(post._id);
      onDelete(post._id);
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      setIsSaving(true);
      const result = await apiService.updatePost(post._id, editContent);
      onPostUpdate(result.post);
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Robust check for user reaction using employeeId string (EMP-xxx)
  // Backend now populates r.user.employeeId
  const userReaction = post.reactions?.find((r: any) => {
    // If populated object
    if (r.user?.employeeId) {
      return r.user.employeeId === user?.employeeId;
    }
    // Fallback: direct ID match (useful if user object has _id matching r.user)
    const reactionId = r.user?._id || r.user;
    return (
      String(reactionId) === String(user?.id) ||
      String(reactionId) === String(user?.employeeId)
    );
  });

  const handleReaction = async () => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      const result = await apiService.toggleReaction(post._id, "like");
      onPostUpdate({ ...post, reactions: result.reactions });
    } catch (error) {
      console.error("Reaction failed", error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleVote = async (index: number) => {
    try {
      const result = await apiService.votePoll(post._id, index);
      onPostUpdate({ ...post, pollData: result.pollData });
    } catch (error) {
      console.error("Voting failed", error);
    }
  };

  const isAuthor =
    post.author?.employeeId === user?.employeeId ||
    post.author?._id === user?.employeeId;

  return (
    <div className="bg-white dark:bg-bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 mb-6 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={
              post.author?.profilePicture
                ? `${ASSET_BASE_URL}/${post.author.profilePicture}`
                : undefined
            }
            alt={post.author?.firstName}
            name={`${post.author?.firstName} ${post.author?.lastName}`}
            className="w-10 h-10 ring-2 ring-white dark:ring-bg-card shadow-sm"
          />
          <div>
            <h4 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              {post.author?.firstName} {post.author?.lastName}
              {post.type === "appreciation" && (
                <span className="text-xs font-normal text-text-secondary">
                  shared an appreciation
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="font-medium text-text-secondary">
                {post.author?.designation || "Employee"}
              </span>
              <span>•</span>
              <span className="text-text-muted">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
        {(isAuthor || user?.role === "Admin") && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-muted hover:text-text-primary p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-bg-hover transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 w-40 bg-white dark:bg-bg-card border border-border shadow-lg rounded-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                {isAuthor && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 dark:hover:bg-bg-hover transition-colors font-medium"
                  >
                    Edit Post
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3 bg-gray-50 dark:bg-bg-hover p-4 rounded-xl border border-border">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary min-h-[100px] text-sm bg-white dark:bg-bg-card"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-medium text-text-secondary hover:bg-gray-200 dark:hover:bg-bg-main rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSaving || !editContent.trim()}
                className="px-4 py-2 text-xs font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 shadow-sm"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : post.type === "appreciation" ? (
          <div className="relative overflow-hidden p-3.5 bg-gradient-to-br from-brand-primary/5 via-brand-secondary/5 to-transparent rounded-xl border border-brand-primary/10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              {post.media && post.media.length > 0 && (
                <div className="flex-shrink-0 bg-white dark:bg-bg-card p-2 rounded-full border border-border shadow-sm ring-2 ring-white/50 dark:ring-white/5">
                  <img
                    src={
                      post.media[0].startsWith("http")
                        ? post.media[0]
                        : `${ASSET_BASE_URL}${post.media[0]}`
                    }
                    alt="Badge"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              )}
              <div className="flex-1 text-text-primary text-sm leading-snug">
                {post.relatedAppreciationId &&
                typeof post.relatedAppreciationId === "object" &&
                "sender" in post.relatedAppreciationId ? (
                  <div className="space-y-1.5">
                    <p className="text-sm">
                      <span className="font-semibold text-brand-primary">
                        {post.relatedAppreciationId.badge?.title}
                      </span>{" "}
                      awarded to{" "}
                      <span className="font-semibold text-text-primary">
                        {post.relatedAppreciationId.recipient?.firstName}{" "}
                        {post.relatedAppreciationId.recipient?.lastName}
                      </span>
                    </p>
                    {post.relatedAppreciationId.message && (
                      <div className="relative pl-3 border-l-2 border-brand-primary/30">
                        <p className="italic text-text-secondary text-sm line-clamp-2">
                          "{post.relatedAppreciationId.message}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{post.content}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-text-primary whitespace-pre-wrap text-[15px] leading-relaxed mb-4">
              {post.content}
            </p>

            {/* Media Grid */}
            {post.media && post.media.length > 0 && (
              <div
                className={`grid gap-2 mb-4 rounded-xl overflow-hidden ${
                  post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {post.media.map((url: string, idx: number) => (
                  <div key={idx} className="relative group cursor-pointer">
                    <img
                      src={
                        url.startsWith("http") ? url : `${ASSET_BASE_URL}${url}`
                      }
                      alt="Post attachment"
                      className="w-full h-full object-cover max-h-[500px] hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                  </div>
                ))}
              </div>
            )}

            {/* Poll UI */}
            {post.type === "poll" && post.pollData && (
              <div className="bg-gray-50/50 dark:bg-black/20 rounded-xl p-4 border border-border backdrop-blur-sm">
                <h5 className="font-semibold text-sm mb-4 text-text-primary flex items-center gap-2">
                  <span className="w-1 h-4 bg-brand-primary rounded-full" />
                  {post.pollData.question || "Poll"}
                </h5>
                <div className="space-y-2.5">
                  {post.pollData.options.map((option: any, idx: number) => {
                    const totalVotes = post.pollData.options.reduce(
                      (acc: number, curr: any) => acc + curr.votes.length,
                      0
                    );
                    const votePercentage =
                      totalVotes === 0
                        ? 0
                        : Math.round((option.votes.length / totalVotes) * 100);
                    const hasVoted = option.votes.some(
                      (v: any) =>
                        v === user?.employeeId || v._id === user?.employeeId
                    );

                    return (
                      <button
                        key={idx}
                        onClick={() => handleVote(idx)}
                        className={`relative w-full text-left p-3 rounded-xl border text-sm transition-all overflow-hidden group/opt ${
                          hasVoted
                            ? "border-brand-primary/30 text-brand-primary font-medium"
                            : "border-border hover:border-brand-primary/30 text-text-primary dark:text-text-primary"
                        }`}
                      >
                        <div
                          className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out ${
                            hasVoted
                              ? "bg-brand-primary/10 dark:bg-brand-primary/20"
                              : "bg-gray-100 dark:bg-white/5 group-hover/opt:bg-brand-primary/5"
                          }`}
                          style={{ width: `${votePercentage}%` }}
                        />
                        <div className="flex justify-between relative z-10">
                          <span>{option.text}</span>
                          <span className="font-semibold">
                            {votePercentage}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-3">
                  <span className="text-xs font-medium text-text-secondary bg-white/50 dark:bg-white/5 px-2 py-1 rounded-md border border-border">
                    {post.pollData.options.reduce(
                      (acc: number, curr: any) => acc + curr.votes.length,
                      0
                    )}{" "}
                    votes total
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Interactions */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex gap-2">
          <button
            onClick={handleReaction}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              userReaction
                ? "text-red-500 bg-red-50 dark:bg-red-900/10"
                : "text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
            }`}
          >
            <Heart
              size={18}
              className={`transition-transform duration-200 ${
                userReaction ? "fill-current scale-110" : "scale-100"
              }`}
            />
            {post.reactions?.length || 0}
            <span className="hidden sm:inline font-normal opacity-80">
              Likes
            </span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              showComments
                ? "text-brand-primary bg-brand-primary/10"
                : "text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10"
            }`}
          >
            <MessageCircle size={18} />
            {post.commentCount || 0}
            <span className="hidden sm:inline font-normal opacity-80">
              Comments
            </span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-1">
          <CommentSection postId={post._id} />
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete Post"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
