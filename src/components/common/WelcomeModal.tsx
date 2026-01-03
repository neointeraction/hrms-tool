import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Modal } from "../common/Modal";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api.service";
import { PartyPopper, Check } from "lucide-react";

export function WelcomeModal() {
  const { user, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.isFirstLogin) {
      setIsOpen(true);
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [user?.isFirstLogin]);

  const handleClose = async () => {
    try {
      await apiService.acknowledgeWelcome();
      setIsOpen(false);
      // Refresh user to update local state (isFirstLogin will become false)
      await refreshUser();
    } catch (error) {
      console.error("Failed to dismiss welcome screen", error);
      setIsOpen(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Disallow closing by clicking backdrop/escape initially
      title="Welcome Verification"
      hideHeader={true}
      maxWidth="max-w-md"
    >
      <div className="text-center p-4">
        <div className="mx-auto w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <PartyPopper size={40} className="text-violet-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to the team, {user.name.split(" ")[0]}! 🎉
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          We're thrilled to have you onboard. Your account is fully set up and
          ready to go. Explore your dashboard to get started!
        </p>

        <button
          onClick={handleClose}
          className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium shadow-lg shadow-violet-200 hover:bg-violet-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          Let's Get Started <Check size={18} />
        </button>
      </div>
    </Modal>
  );
}
