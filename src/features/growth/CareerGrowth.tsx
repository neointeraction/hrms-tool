import { Award, TrendingUp, MessageSquare, Star } from "lucide-react";

export default function CareerGrowth() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Career & Growth</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certifications & Progress */}
        <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-brand-primary" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Learning Path
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">
                  Advanced Figma Certification
                </span>
                <span className="text-sm text-text-secondary">50%</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-1/2 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">
                  React Design Patterns
                </span>
                <span className="text-sm text-text-secondary">75%</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-brand-secondary w-3/4 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">
                  Accessibility Standards
                </span>
                <span className="text-sm text-text-secondary">30%</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-brand-accent w-[30%] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-status-warning" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Achievements
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 bg-bg-main rounded-lg border border-border hover:border-brand-primary transition-colors cursor-pointer group">
              <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-3 group-hover:scale-110 transition-transform">
                <Star size={24} fill="currentColor" />
              </div>
              <span className="font-medium text-text-primary">
                Pixel Perfect
              </span>
              <span className="text-xs text-text-secondary mt-1">
                Design Excellence
              </span>
            </div>

            <div className="flex flex-col items-center p-4 bg-bg-main rounded-lg border border-border hover:border-brand-primary transition-colors cursor-pointer group">
              <div className="h-12 w-12 rounded-full bg-status-success/10 flex items-center justify-center text-status-success mb-3 group-hover:scale-110 transition-transform">
                <Award size={24} />
              </div>
              <span className="font-medium text-text-primary">Team Player</span>
              <span className="text-xs text-text-secondary mt-1">Q1 2025</span>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="md:col-span-2 bg-bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="text-brand-secondary" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Recent Feedback
            </h2>
          </div>

          <div className="bg-bg-main/50 rounded-lg p-6 border border-border">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold shrink-0">
                A
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-text-primary">
                    Anonymous Peer
                  </span>
                  <span className="text-xs text-text-muted">• 2 days ago</span>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  "Rohan consistently delivers high-quality designs and is
                  always willing to help other team members. His recent work on
                  the dashboard redesign was exceptional and significantly
                  improved the user experience."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
