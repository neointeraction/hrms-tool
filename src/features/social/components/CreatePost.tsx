import { useState, useRef } from "react";
import { Image as ImageIcon, BarChart2, X, Loader2, Users } from "lucide-react";
import { apiService, ASSET_BASE_URL } from "../../../services/api.service";
import { useAuth } from "../../../context/AuthContext";
import { Avatar } from "../../../components/common/Avatar";

interface CreatePostProps {
  onPostCreated: (post: any) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [scope, setScope] = useState<"company" | "department" | "project">(
    "company"
  );
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      try {
        const file = e.target.files[0];
        const result = await apiService.uploadSocialMedia(file);
        setMedia([...media, result.url]);
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && media.length === 0 && !isPoll) return;

    setPosting(true);
    try {
      const payload: any = {
        content,
        scope,
        media,
        type: isPoll ? "poll" : media.length > 0 ? "image" : "text",
      };

      if (isPoll) {
        payload.pollData = {
          question: content || "Poll Question", // If content empty, use default
          options: pollOptions
            .filter((o) => o.trim())
            .map((text) => ({ text, votes: [] })),
          allowMultiple: false,
        };
        // Basic validation
        if (payload.pollData.options.length < 2) {
          alert("Poll needs at least 2 options");
          setPosting(false);
          return;
        }
      }

      const result = await apiService.createPost(payload);
      onPostCreated(result.post);

      // Reset
      setContent("");
      setMedia([]);
      setIsPoll(false);
      setPollOptions(["", ""]);
    } catch (error) {
      console.error("Post failed", error);
    } finally {
      setPosting(false);
    }
  };

  const addPollOption = () => setPollOptions([...pollOptions, ""]);
  const updatePollOption = (idx: number, val: string) => {
    const newOpts = [...pollOptions];
    newOpts[idx] = val;
    setPollOptions(newOpts);
  };

  return (
    <div className="bg-white dark:bg-bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow duration-300">
      <div className="flex gap-4">
        <Avatar
          src={user?.avatar ? `${ASSET_BASE_URL}/${user.avatar}` : undefined}
          name={user?.name}
          className="w-11 h-11 ring-2 ring-white dark:ring-bg-card shadow-sm"
        />
        <div className="flex-1 space-y-3">
          {/* Scope Selector */}
          <div className="flex items-center">
            <div className="relative inline-block group">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="appearance-none bg-gray-50 dark:bg-bg-hover text-xs font-medium pl-3 pr-8 py-1.5 rounded-full text-text-secondary hover:text-brand-primary hover:bg-brand-primary/5 focus:outline-none cursor-pointer transition-colors border border-transparent hover:border-brand-primary/20"
              >
                <option value="company">Everyone</option>
                <option value="department">My Department</option>
                <option value="project">My Project</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-text-muted group-hover:text-brand-primary transition-colors">
                <Users size={12} />
              </div>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isPoll ? "Ask a question..." : "What's on your mind?"}
            className="w-full border-none p-0 focus:ring-0 resize-none text-base min-h-[60px] placeholder:text-text-muted/60 bg-transparent text-text-primary"
          />

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {media.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-32 h-32 flex-shrink-0 group"
                >
                  <img
                    src={url}
                    alt="preview"
                    className="w-full h-full object-cover rounded-xl shadow-sm border border-border"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                  <button
                    onClick={() => removeMedia(idx)}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {uploading && (
                <div className="w-32 h-32 flex items-center justify-center bg-gray-50 dark:bg-bg-hover rounded-xl border border-border border-dashed animate-pulse">
                  <Loader2 className="animate-spin text-brand-primary" />
                </div>
              )}
            </div>
          )}

          {/* Poll Builder */}
          {isPoll && (
            <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-border space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => updatePollOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full px-4 py-2 text-sm border border-border dark:bg-bg-card rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                ))}
              </div>
              <button
                onClick={addPollOption}
                className="text-xs text-brand-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span className="text-lg leading-none">+</span> Add Option
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex justify-between items-center pt-3 mt-1 border-t border-border/50">
            <div className="flex gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-full transition-all duration-200"
                title="Add Photo"
              >
                <ImageIcon size={20} className="stroke-[1.5]" />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </button>
              <button
                onClick={() => setIsPoll(!isPoll)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isPoll
                    ? "text-brand-primary bg-brand-primary/10"
                    : "text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10"
                }`}
                title="Create Poll"
              >
                <BarChart2 size={20} className="stroke-[1.5]" />
              </button>
            </div>

            <button
              onClick={handlePost}
              disabled={posting || (!content && media.length === 0 && !isPoll)}
              className="bg-brand-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {posting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Posting
                </span>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
