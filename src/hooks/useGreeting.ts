import { useState, useEffect } from "react";

export function useGreeting() {
  const [greeting, setGreeting] = useState<{
    text: string;
  }>({
    text: "Good Morning",
  });

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting({ text: "Good Morning" });
      else if (hour < 17) setGreeting({ text: "Good Afternoon" });
      else setGreeting({ text: "Good Evening" });
    };

    updateGreeting();
    // Update every minute to keep it fresh
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return greeting;
}
