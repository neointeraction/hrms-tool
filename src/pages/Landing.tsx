import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Check,
  X,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  CreditCard,
  Clock,
} from "lucide-react";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companySize: "",
  });

  // Force dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  useEffect(() => {
    // Master Timeline for Hero Section on Page Load
    const masterTL = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Navbar drops from top
    masterTL.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 }
    );

    // Hero badge reveals
    masterTL.fromTo(
      ".hero-badge",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6 },
      "-=0.4"
    );

    // Split headline into words and stagger
    const headlineWords = document.querySelectorAll(".hero-headline .word");
    masterTL.fromTo(
      headlineWords,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
      "-=0.3"
    );

    // Hero subheadline
    masterTL.fromTo(
      ".hero-subheadline",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );

    // Hero CTAs with bounce
    masterTL.fromTo(
      ".hero-cta",
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)",
      },
      "-=0.3"
    );

    // Hero trust indicators
    masterTL.fromTo(
      ".hero-trust",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.1 },
      "-=0.3"
    );

    // Hero image with 3D entrance
    masterTL.fromTo(
      ".hero-image",
      { opacity: 0, scale: 0.95, rotationY: -15, z: -100 },
      {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        z: 0,
        duration: 1.2,
        ease: "power3.out",
      },
      "-=0.6"
    );

    // Continuous 3D floating animation for hero image
    gsap.to(".hero-image", {
      y: -20,
      rotationX: 5,
      rotationY: 3,
      duration: 3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Parallax background blobs
    gsap.to(".bg-blob-1", {
      y: 200,
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    gsap.to(".bg-blob-2", {
      y: 150,
      x: -100,
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Features Section Timeline
    const featuresTL = gsap.timeline({
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    // Features heading
    featuresTL.fromTo(
      ".features-heading",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }
    );

    // Features subheading
    featuresTL.fromTo(
      ".features-subheading",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
      "-=0.5"
    );

    // Apple-style 3D Rotate Effect for Features
    const featureCanvas = document.querySelector(".feature-3d-canvas");
    const featureScreens = gsap.utils.toArray(".rotating-screen");

    if (featureCanvas && featureScreens.length > 0) {
      // Set initial state - first screen visible, all others hidden
      featureScreens.forEach((screen: any, index) => {
        if (index === 0) {
          gsap.set(screen, {
            autoAlpha: 1,
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            z: 0,
            display: "flex",
          });
        } else {
          gsap.set(screen, {
            autoAlpha: 0,
            rotateY: 90,
            rotateX: 10,
            scale: 0.8,
            z: -500,
            display: "none",
          });
        }
      });

      // Pin the section and create scroll-driven rotation
      ScrollTrigger.create({
        trigger: featuresRef.current,
        start: "top top",
        end: "+=4000", // 4000px of scroll for smooth rotation
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalScreens = featureScreens.length;
          const screenProgress = progress * totalScreens;
          const currentScreen = Math.floor(screenProgress);
          const screenTransition = screenProgress - currentScreen;

          featureScreens.forEach((screen: any, index) => {
            let autoAlpha = 0;
            let rotateY = 90;
            let rotateX = 10;
            let scale = 0.8;
            let z = -500;
            let display = "none";

            if (index === currentScreen) {
              // Current screen - rotating out
              autoAlpha = 1 - screenTransition;
              rotateY = screenTransition * -90;
              rotateX = screenTransition * 10;
              scale = 1 - screenTransition * 0.2;
              z = -(screenTransition * 500);
              display = "flex";
            } else if (index === currentScreen + 1) {
              // Next screen - rotating in from right
              autoAlpha = screenTransition;
              rotateY = 90 - screenTransition * 90;
              rotateX = 10 - screenTransition * 10;
              scale = 0.8 + screenTransition * 0.2;
              z = -500 + screenTransition * 500;
              display = "flex";
            } else {
              // All other screens - completely hidden
              autoAlpha = 0;
              rotateY = 90;
              rotateX = 10;
              scale = 0.8;
              z = -500;
              display = "none";
            }

            gsap.set(screen, {
              autoAlpha,
              rotateY,
              rotateX,
              scale,
              z,
              display,
            });
          });
        },
      });
    }

    // Pricing Section Timeline
    const pricingTL = gsap.timeline({
      scrollTrigger: {
        trigger: pricingRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    // Pricing heading
    pricingTL.fromTo(
      ".pricing-heading",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }
    );

    // Pricing subheading
    pricingTL.fromTo(
      ".pricing-subheading",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
      "-=0.5"
    );

    // Billing toggle
    pricingTL.fromTo(
      ".billing-toggle",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.4"
    );

    // Pricing cards with 3D transforms
    pricingTL.fromTo(
      ".pricing-card",
      { opacity: 0, y: 60, scale: 0.95, rotationY: 20, z: -300 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationY: 0,
        z: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      },
      "-=0.3"
    );

    // Pro plan "pop" effect
    pricingTL.to(
      ".pricing-card-pro",
      {
        scale: 1.05,
        duration: 0.4,
        ease: "back.out(1.7)",
      },
      "-=0.2"
    );

    // CTA Section Timeline
    const ctaTL = gsap.timeline({
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    ctaTL.fromTo(
      ".cta-box",
      { opacity: 0, scale: 0.9, y: 50 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: "expo.out" }
    );

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      masterTL.kill();
    };
  }, []);

  const handleTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/signup", { state: formData });
  };

  const companySizeOptions = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "500+", label: "500+ employees" },
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: { monthly: 29, annual: 290 },
      description: "Perfect for small teams getting started",
      features: [
        "Up to 50 employees",
        "Core HR features",
        "Leave management",
        "Basic reporting",
        "Email support",
      ],
      notIncluded: ["Advanced analytics", "Custom workflows", "API access"],
    },
    {
      name: "Pro",
      price: { monthly: 79, annual: 790 },
      description: "For growing companies that need more",
      features: [
        "Up to 200 employees",
        "All Starter features",
        "Performance reviews",
        "Advanced analytics",
        "Custom workflows",
        "Priority support",
        "API access",
      ],
      notIncluded: ["Dedicated account manager"],
      popular: true,
    },
    {
      name: "Enterprise",
      price: { monthly: "Custom", annual: "Custom" },
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited employees",
        "All Pro features",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "24/7 phone support",
        "On-premise deployment",
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="dark min-h-screen bg-bg-main text-text-primary overflow-hidden relative">
      {/* Parallax Background Blobs */}
      <div className="bg-blob-1 absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="bg-blob-2 absolute top-1/2 left-0 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation */}
      <nav
        ref={navRef}
        className="reveal fixed top-0 left-0 right-0 z-50 bg-bg-sidebar/80 border-border"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-text-primary">
            NeoInteraction HR
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowTrialModal(true)}
              className="magnetic-button px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-text-primary shadow-lg shadow-brand-primary/20 rounded-lg font-medium hover:shadow-lg hover:shadow-brand-primary/50 transition-all"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="hero-badge reveal inline-block px-4 py-2 bg-brand-primary/10 border-brand-primary/20 text-brand-primary text-sm font-medium">
                ✨ The Future of HR Management
              </div>
              <h1 className="hero-headline text-5xl lg:text-7xl font-bold leading-tight">
                <span className="word reveal">Reimagine</span>{" "}
                <span className="word reveal">Your</span>{" "}
                <span className="word reveal text-text-primary">Workforce</span>{" "}
                <span className="word reveal text-text-primary">
                  Management
                </span>
              </h1>
              <p className="hero-subheadline reveal text-xl text-text-secondary leading-relaxed">
                Streamline HR operations, empower your team, and drive growth
                with NeoInteraction HR. The modern HR platform built for growing
                businesses.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowTrialModal(true)}
                  className="hero-cta reveal magnetic-button px-8 py-4 bg-brand-primary hover:bg-brand-secondary text-text-primary shadow-lg shadow-brand-primary/20 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-brand-primary/50 transition-all transform hover:scale-105"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="hero-cta reveal px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
                >
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-8 text-sm text-text-secondary">
                <div className="hero-trust reveal flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="hero-trust reveal flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="hero-image reveal relative z-10">
                <div className="aspect-video bg-bg-card border-border p-8 shadow-2xl">
                  <div className="space-y-4">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="aspect-square bg-white/5 rounded-lg"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-brand-primary hover:bg-brand-secondary text-text-primary shadow-lg shadow-brand-primary/20 blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-10 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="features-heading reveal text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-text-primary">Succeed</span>
            </h2>
            <p className="features-subheading reveal text-xl text-text-secondary max-w-2xl mx-auto">
              Powerful features designed to simplify HR management and boost
              productivity
            </p>
          </div>
          {/* Apple-style 3D Rotating Canvas */}
          <div
            className="feature-3d-canvas relative h-[600px] flex items-center justify-center"
            style={{ perspective: "2000px", transformStyle: "preserve-3d" }}
          >
            {/* Screen 1 - Employee Management */}
            <div
              className="rotating-screen absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="max-w-4xl w-full">
                <div className="relative">
                  <div className="hidden"></div>
                  <div className="relative bg-bg-card border-border rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-4 text-sm text-text-secondary">
                        Employee Directory
                      </div>
                    </div>
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Users className="w-8 h-8 text-text-secondary" />
                        <h3 className="text-3xl font-bold">
                          Employee Management
                        </h3>
                      </div>
                      <p className="text-text-secondary">
                        Centralize employee data and track performance
                      </p>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="w-12 h-12 rounded-full bg-bg-hover"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-white/10 rounded w-40"></div>
                            <div className="h-2 bg-white/5 rounded w-56"></div>
                          </div>
                          <div className="w-8 h-8 bg-brand-primary/20 rounded flex items-center justify-center">
                            <Users className="w-4 h-4 text-text-secondary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen 3 - Performance Reviews */}
            <div
              className="rotating-screen absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="max-w-4xl w-full">
                <div className="relative">
                  <div className="hidden"></div>
                  <div className="relative bg-bg-card border-border rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-4 text-sm text-text-secondary">
                        Performance Dashboard
                      </div>
                    </div>
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <TrendingUp className="w-8 h-8 text-text-secondary" />
                        <h3 className="text-3xl font-bold">
                          Performance Reviews
                        </h3>
                      </div>
                      <p className="text-text-secondary">
                        Conduct 360° reviews and track growth
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {["Goals", "Reviews", "Growth"].map((label, i) => (
                        <div
                          key={i}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="text-xs text-text-secondary mb-1">
                            {label}
                          </div>
                          <div className="text-3xl font-bold">
                            {85 + i * 5}%
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-end gap-2 h-32">
                      {[60, 75, 70, 85, 90].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-brand-primary rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen 4 - Payroll & Compliance */}
            <div
              className="rotating-screen absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="max-w-4xl w-full">
                <div className="relative">
                  <div className="hidden"></div>
                  <div className="relative bg-bg-card border-border rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-4 text-sm text-text-secondary">
                        Payroll Overview
                      </div>
                    </div>
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Shield className="w-8 h-8 text-text-secondary" />
                        <h3 className="text-3xl font-bold">
                          Payroll & Compliance
                        </h3>
                      </div>
                      <p className="text-text-secondary">
                        Streamline payroll and ensure compliance
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary">
                          Total Payroll
                        </span>
                        <Shield className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-4xl font-bold">$125,450</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {["Processed", "Pending"].map((status, i) => (
                        <div
                          key={i}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="text-sm text-text-secondary mb-1">
                            {status}
                          </div>
                          <div className="text-2xl font-bold">
                            {i === 0 ? "45" : "5"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen 5 - Automated Workflows */}
            <div
              className="rotating-screen absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="max-w-4xl w-full">
                <div className="relative">
                  <div className="hidden"></div>
                  <div className="relative bg-bg-card border-border rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-4 text-sm text-text-secondary">
                        Workflow Automation
                      </div>
                    </div>
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Zap className="w-8 h-8 text-text-secondary" />
                        <h3 className="text-3xl font-bold">
                          Automated Workflows
                        </h3>
                      </div>
                      <p className="text-text-secondary">
                        Reduce manual work with automation
                      </p>
                    </div>
                    <div className="space-y-3">
                      {[
                        "Onboarding",
                        "Leave Approval",
                        "Payroll Processing",
                      ].map((workflow, i) => (
                        <div
                          key={i}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-yellow-400" />
                            <div className="flex-1">
                              <div className="font-semibold">{workflow}</div>
                              <div className="text-sm text-text-secondary">
                                Automated
                              </div>
                            </div>
                            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                              Active
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen 6 - Multi-tenant Support */}
            <div
              className="rotating-screen absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="max-w-4xl w-full">
                <div className="relative">
                  <div className="hidden"></div>
                  <div className="relative bg-bg-card border-border rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-4 text-sm text-text-secondary">
                        Organizations
                      </div>
                    </div>
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Globe className="w-8 h-8 text-text-secondary" />
                        <h3 className="text-3xl font-bold">
                          Multi-tenant Support
                        </h3>
                      </div>
                      <p className="text-text-secondary">
                        Manage multiple organizations seamlessly
                      </p>
                    </div>
                    <div className="space-y-3">
                      {["Acme Corp", "Tech Solutions", "Global Industries"].map(
                        (org, i) => (
                          <div
                            key={i}
                            className="bg-white/5 rounded-lg p-4 border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg hiddener justify-center">
                                <Globe className="w-6 h-6 text-text-secondary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold">{org}</div>
                                <div className="text-sm text-text-secondary">
                                  {50 + i * 25} employees
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="pricing-heading reveal text-4xl lg:text-5xl font-bold mb-4">
              Simple,{" "}
              <span className="text-text-primary">Transparent Pricing</span>
            </h2>
            <p className="pricing-subheading reveal text-xl text-text-secondary mb-8">
              Choose the plan that fits your organization
            </p>

            {/* Billing Toggle */}
            <div className="billing-toggle reveal inline-flex items-center gap-4 p-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-brand-primary hover:bg-brand-secondary text-text-primary shadow-lg shadow-brand-primary/20 text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === "annual"
                    ? "bg-brand-primary hover:bg-brand-secondary text-text-primary shadow-lg shadow-brand-primary/20 text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          <div
            className="grid md:grid-cols-3 gap-8"
            style={{ perspective: "2000px" }}
          >
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                style={{ transformStyle: "preserve-3d" }}
                className={`pricing-card ${
                  tier.popular ? "pricing-card-pro" : ""
                } reveal relative p-8 rounded-2xl border transition-all hover:scale-105 ${
                  tier.popular
                    ? "bg-bg-card border-brand-primary shadow-xl shadow-brand-primary/20"
                    : "bg-bg-card border-border hover:border-brand-primary/50"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-primary hover:bg-brand-secondary text-text-primary shadow-lg shadow-brand-primary/20 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-text-secondary text-sm">
                    {tier.description}
                  </p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    {typeof tier.price[billingCycle] === "number" ? (
                      <>
                        <span className="text-5xl font-bold">
                          ${tier.price[billingCycle]}
                        </span>
                        <span className="text-text-secondary">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">
                        {tier.price[billingCycle]}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowTrialModal(true)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all mb-6 ${
                    tier.popular
                      ? "bg-brand-primary hover:bg-brand-secondary text-text-primary shadow-lg shadow-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/50"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {tier.name === "Enterprise"
                    ? "Contact Sales"
                    : "Start Free Trial"}
                </button>
                <div className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-text-secondary">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {tier.notIncluded.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-50">
                      <X className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-text-muted">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="cta-box reveal p-12 bg-bg-card border-border rounded-3xl">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your HR?
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Join thousands of companies already using our platform
            </p>
            <button
              onClick={() => setShowTrialModal(true)}
              className="magnetic-button px-8 py-4 bg-brand-primary hover:bg-brand-secondary text-text-primary shadow-lg shadow-brand-primary/20 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-brand-primary/50 transition-all transform hover:scale-105"
            >
              Start Your Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-text-secondary">
          <p>&copy; 2025 NeoInteraction HR. All rights reserved.</p>
        </div>
      </footer>

      {/* Trial Modal */}
      <Modal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        title=""
        hideHeader
        padding="p-0"
        maxWidth="max-w-lg"
      >
        <div className="relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-brand-primary/20 to-transparent pointer-events-none"></div>
          <div className="relative p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-primary/20 shadow-lg shadow-brand-primary/10">
                <Zap className="w-8 h-8 text-brand-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Start Your Free Trial
              </h2>
              <p className="text-text-secondary">
                Join 10,000+ HR professionals transforming their workforce with
                NeoInteraction.
              </p>
            </div>

            <form onSubmit={handleTrialSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                  className="bg-bg-main"
                />
                <Select
                  label="Company Size"
                  options={companySizeOptions}
                  value={formData.companySize}
                  onChange={(val) =>
                    setFormData({ ...formData, companySize: String(val) })
                  }
                  placeholder="Select size"
                  required
                  triggerClassName="bg-bg-main"
                />
              </div>

              <Input
                label="Work Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@company.com"
                required
                className="bg-bg-main"
              />

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-lg bg-bg-main/50 border border-white/10">
                  <CreditCard className="w-5 h-5 text-brand-primary" />
                  <span className="text-xs font-medium text-text-secondary">
                    No Credit Card
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-lg bg-bg-main/50 border border-white/10">
                  <Clock className="w-5 h-5 text-brand-primary" />
                  <span className="text-xs font-medium text-text-secondary">
                    14-Day Free Trial
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-lg bg-bg-main/50 border border-white/10">
                  <Shield className="w-5 h-5 text-brand-primary" />
                  <span className="text-xs font-medium text-text-secondary">
                    Full Access
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full py-3 text-lg font-semibold shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all hover:-translate-y-0.5"
                >
                  Create My Account
                </Button>
              </div>

              <button
                type="button"
                onClick={() => setShowTrialModal(false)}
                className="w-full text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Maybe later
              </button>
            </form>
          </div>
        </div>
      </Modal>

      <style>{`
        /* Reveal class to prevent FOUC */
        .reveal {
          will-change: transform;
        }

        /* 3D Transform styles */
        .feature-3d-canvas,
        .rotating-screen,
        .pricing-card {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        .rotating-screen {
          pointer-events: none;
          visibility: hidden;
        }

        .rotating-screen[style*="opacity: 1"],
        .rotating-screen[style*="opacity: 0."] {
          visibility: visible;
        }

        .magnetic-button {
          position: relative;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .magnetic-button:hover {
          transform: translateY(-2px);
        }

        /* Word spacing for headline */
        .hero-headline .word {
          display: inline-block;
          margin-right: 0.3em;
        }
      `}</style>
    </div>
  );
}
