import { useEffect, useMemo, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaArrowDown,
  FaArrowRight,
  FaBell,
  FaBook,
  FaBuilding,
  FaCalendarCheck,
  FaCheckCircle,
  FaClipboardList,
  FaCogs,
  FaGem,
  FaLightbulb,
  FaQuoteLeft,
  FaRocket,
  FaShieldAlt,
  FaStar,
  FaTicketAlt,
  FaUsers,
} from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";

const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&auto=format",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&auto=format",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&auto=format",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&auto=format",
];

const CTA_BG_URL =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&auto=format";

const moduleCards = [
  {
    
    name: "Facilities & Assets Catalogue",
    icon: FaBuilding,
    description: "Manage lecture halls, labs, equipment, and all physical campus assets in one place.",
    route: "/admin",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500&auto=format",
  },
  {
    
    name: "Booking Management",
    icon: FaCalendarCheck,
    description: "Handle booking requests, approvals, schedules, and conflicts with a clear workflow.",
    route: "/bookings",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&auto=format",
  },
  {
    
    name: "Incident Tickets",
    icon: FaTicketAlt,
    description: "Track maintenance and service issues with priorities, status updates, and ownership.",
    route: "/tickets",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&auto=format",
  },
  {
    
    name: "Notifications",
    icon: FaBell,
    description: "Deliver instant campus-wide alerts and targeted updates in real time.",
    route: "/notifications",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format",
  },
  {
    
    name: "Authentication",
    icon: FaShieldAlt,
    description: "Secure role-based access for administrators, staff, and students.",
    route: "/login",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&auto=format",
  },
];

const whyChooseUs = [
  {
    title: "Enterprise Security",
    icon: FaShieldAlt,
    description: "Role-based access, audit trails, and secure workflows built for institutional reliability.",
  },
  {
    title: "Operational Intelligence",
    icon: FaLightbulb,
    description: "Live insights help teams predict bottlenecks and optimize campus resource allocation.",
  },
  {
    title: "Scalable Platform",
    icon: FaRocket,
    description: "A modular architecture that grows from one department to full multi-campus operations.",
  },
];

const features = [
  {
    title: "Resource Management",
    icon: FaBuilding,
    description: "Centralized visibility of facilities, assets, and operational availability.",
  },
  {
    title: "Booking System",
    icon: FaBook,
    description: "Fast booking flows with clear availability and schedule control.",
  },
  {
    title: "Incident Tickets",
    icon: FaClipboardList,
    description: "Structured ticket lifecycle from issue reporting to closure.",
  },
  {
    title: "Real-time Notifications",
    icon: FaBell,
    description: "Immediate alerts for status changes, incidents, and booking events.",
  },
];

const statTargets = [
  { key: "resources", label: "Total Resources", target: 12, icon: FaBuilding, color: "#06b6d4" },
  { key: "bookings", label: "Active Bookings", target: 28, icon: FaCalendarCheck, color: "#3b82f6" },
  { key: "tickets", label: "Resolved Tickets", target: 45, icon: FaCheckCircle, color: "#10b981" },
  { key: "users", label: "Active Users", target: 156, icon: FaUsers, color: "#8b5cf6" },
];

const testimonials = [
  {
    name: "Naduni Perera",
    role: "Facilities Coordinator",
    quote:
      "Our operations team now coordinates bookings and maintenance in half the time. The visibility is outstanding.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Kavindu Silva",
    role: "Student Services Lead",
    quote:
      "Students instantly see what is available and receive updates without confusion. It drastically improved trust.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Ayesha Fernando",
    role: "Campus Operations Manager",
    quote:
      "The ticketing and notification flows are seamless. We can resolve incidents faster and keep everyone informed.",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
  },
];

const easeOutCubic = (value) => 1 - (1 - value) ** 3;

const RippleButton = ({ className, children, onClick, type = "button" }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const id = Date.now();

    setRipples((previous) => [...previous, { id, x, y, size }]);
    window.setTimeout(() => {
      setRipples((previous) => previous.filter((ripple) => ripple.id !== id));
    }, 600);

    onClick?.(event);
  };

  return (
    <button type={type} onClick={handleClick} className={`relative overflow-hidden ${className}`}>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full bg-white/40 animate-ripple"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
};

const AnimatedStat = ({ label, target, icon: Icon, color }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.35 });
  const [value, setValue] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const rawProgress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(rawProgress);
      setValue(Math.round(target * eased));
      setProgress(eased);

      if (rawProgress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
  }, [inView, target]);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      ref={ref}
      data-aos="fade-up"
      className="group rounded-3xl border border-white/30 bg-white/60 p-5 text-center shadow-[8px_8px_22px_rgba(148,163,184,0.28),-8px_-8px_22px_rgba(255,255,255,0.8)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:shadow-[12px_12px_26px_rgba(59,130,246,0.22),-8px_-8px_22px_rgba(255,255,255,0.9)] dark:border-slate-700/40 dark:bg-slate-900/45 dark:shadow-[8px_8px_22px_rgba(2,6,23,0.55),-8px_-8px_22px_rgba(30,41,59,0.35)]"
    >
      <div className="mx-auto mb-4 h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(148,163,184,0.28)" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.12s linear" }}
          />
        </svg>
        <div className="-mt-[68px] flex items-center justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] text-white shadow-md transition group-hover:animate-bounce">
            <Icon className="text-lg" />
          </span>
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
        {label}
      </p>
    </div>
  );
};

const InteractiveModuleCard = ({ module, index, imageLoaded, onImageLoad, onExplore }) => {
  const Icon = module.icon;
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * -10, y: (x - 0.5) * 12 });
  };

  return (
    <motion.article
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      transition={{ type: "spring", stiffness: 100, damping: 14 }}
      data-aos="fade-up"
      data-aos-delay={index * 70}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-2 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-[#3b82f6]/0 via-[#8b5cf6]/0 to-[#06b6d4]/0 opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="absolute inset-[1px] rounded-3xl bg-white dark:bg-slate-900" />

      <div className="relative z-10">
        <div className="relative h-52 overflow-hidden">
          {!imageLoaded ? <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" /> : null}
          <img
            src={module.image}
            alt={module.name}
            onLoad={onImageLoad}
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/25 to-transparent opacity-80" />
          <div className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#3b82f6]/70 via-[#8b5cf6]/50 to-transparent transition-all duration-500 group-hover:h-full" />

          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <Icon className="transition duration-300 group-hover:scale-125" />
            Module {module.id}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{module.name}</h3>
          <p className="mt-3 min-h-[72px] text-sm text-slate-600 dark:text-slate-300">{module.description}</p>

          <button
            type="button"
            onClick={onExplore}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
          >
            Learn More
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

const HomePage = ({ navigate }) => {
  const [pageLoading, setPageLoading] = useState(true);
  const [typedPrimary, setTypedPrimary] = useState("");
  const [typedSecondary, setTypedSecondary] = useState("");
  const [countdown, setCountdown] = useState(48 * 60 * 60);
  const [loadedImages, setLoadedImages] = useState({});
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 750, once: true, easing: "ease-out-cubic" });
  }, []);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setPageLoading(false), 950);
    return () => window.clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    const first = "Smart Campus";
    const second = "Operations Hub";

    let firstIndex = 0;
    let secondIndex = 0;

    const firstTimer = window.setInterval(() => {
      firstIndex += 1;
      setTypedPrimary(first.slice(0, firstIndex));
      if (firstIndex >= first.length) {
        window.clearInterval(firstTimer);

        window.setTimeout(() => {
          const secondTimer = window.setInterval(() => {
            secondIndex += 1;
            setTypedSecondary(second.slice(0, secondIndex));
            if (secondIndex >= second.length) {
              window.clearInterval(secondTimer);
            }
          }, 80);
        }, 220);
      }
    }, 75);

    return () => window.clearInterval(firstTimer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isHeroHovered) {
      return undefined;
    }

    const sliderTimer = window.setInterval(() => {
      setActiveHeroSlide((previous) => (previous + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => window.clearInterval(sliderTimer);
  }, [isHeroHovered]);

  const countdownLabel = useMemo(() => {
    const hours = String(Math.floor(countdown / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((countdown % 3600) / 60)).padStart(2, "0");
    const seconds = String(countdown % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }, [countdown]);

  const goToRoute = (route) => {
    navigate?.(route);
  };

  const handleTouchStart = (event) => {
    const startX = event.changedTouches?.[0]?.clientX;
    if (typeof startX === "number") {
      setTouchStartX(startX);
      setTouchEndX(startX);
    }
  };

  const handleTouchMove = (event) => {
    const currentX = event.changedTouches?.[0]?.clientX;
    if (typeof currentX === "number") {
      setTouchEndX(currentX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) {
      return;
    }

    const deltaX = touchStartX - touchEndX;
    const minSwipeDistance = 40;

    if (deltaX > minSwipeDistance) {
      setActiveHeroSlide((previous) => (previous + 1) % HERO_SLIDES.length);
    } else if (deltaX < -minSwipeDistance) {
      setActiveHeroSlide((previous) => (previous - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950">
        <div className="relative h-24 w-24">
          <span className="absolute inset-0 rounded-full border-4 border-cyan-400/20" />
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-400 border-r-blue-500" />
          <span className="absolute inset-3 animate-pulse rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
    >
      <section
        className="relative isolate min-h-[86vh] overflow-hidden"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0">
          {HERO_SLIDES.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                activeHeroSlide === index ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${image})` }}
              aria-hidden={activeHeroSlide !== index}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-blue-950/55 to-slate-900/80" />

        <div className="absolute inset-0">
          {[...Array(12)].map((_, index) => (
            <span
              key={`particle-${index}`}
              className="absolute rounded-full bg-white/10 blur-[1px]"
              style={{
                width: `${12 + (index % 5) * 8}px`,
                height: `${12 + (index % 5) * 8}px`,
                left: `${5 + index * 8}%`,
                top: `${8 + (index % 4) * 20}%`,
                animation: `float ${3 + index * 0.32}s ease-in-out ${index * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl" data-aos="fade-right">
            <p className="mb-4 inline-flex items-center rounded-full border border-cyan-300/45 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur">
              Campus Digital Command Center
            </p>

            <h1 className="min-h-[120px] text-4xl font-black leading-tight text-white sm:text-5xl md:min-h-[146px] md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                {typedPrimary}
              </span>
              <br />
              <span>
                {typedSecondary}
                <span className="animate-pulse text-cyan-200">|</span>
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base text-slate-200 sm:text-lg">
              Complete campus management solution for facilities, bookings, incident handling, and enterprise-level
              operational visibility.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-[length:200%_200%] p-[1px] animate-gradient border-0 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4]">
                <RippleButton
                  onClick={() => goToRoute("/admin")}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  Admin Dashboard
                </RippleButton>
              </div>

              <div className="rounded-xl bg-[length:200%_200%] p-[1px] animate-gradient bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#8b5cf6]">
                <RippleButton
                  onClick={() => goToRoute("/student")}
                  className="rounded-xl bg-slate-950/70 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                  Student Dashboard
                </RippleButton>
              </div>

              <RippleButton
                onClick={() => goToRoute("/login")}
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Get Started
              </RippleButton>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => document.getElementById("stats-section")?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-cyan-100 transition hover:text-white"
          aria-label="Scroll down"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur">
            <FaArrowDown className="animate-bounce" />
          </span>
        </button>
      </section>

      <section id="stats-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center" data-aos="fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">Insights</p>
          <h2 className="mt-3 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            Live Statistics
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statTargets.map((item) => (
            <AnimatedStat
              key={item.key}
              label={item.label}
              target={item.target}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center" data-aos="fade-up">
          <h2 className="mt-3 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            Platform Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {moduleCards.map((module, index) => (
            <InteractiveModuleCard
              key={module.id}
              module={module}
              index={index}
              imageLoaded={loadedImages[module.id]}
              onImageLoad={() => setLoadedImages((previous) => ({ ...previous, [module.id]: true }))}
              onExplore={() => goToRoute(module.route)}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center" data-aos="fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">Why Choose Us</p>
          <h2 className="mt-3 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            Built For High-Performance Campuses
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {whyChooseUs.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                data-aos="fade-up"
                data-aos-delay={index * 120}
                whileHover={{ y: -8 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-[0_18px_45px_rgba(59,130,246,0.2)] dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative mb-4 inline-flex">
                  <span className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#3b82f6]/30 to-[#8b5cf6]/30 blur-lg" />
                  <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white">
                    <Icon />
                  </span>
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-900/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center" data-aos="fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">Features</p>
            <h2 className="mt-3 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
              Core Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  data-aos="fade-up"
                  data-aos-delay={index * 90}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#3b82f6]/60 hover:shadow-[0_0_24px_rgba(59,130,246,0.18)] dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] text-white shadow-lg">
                    <Icon />
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <FaCheckCircle className="transition duration-300 group-hover:scale-125 group-hover:rotate-12" />
                    Verified performance workflow
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" data-aos="fade-up">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">Testimonials</p>
          <h2 className="mt-3 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            What People Say
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          spaceBetween={20}
          className="pb-12"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.name}>
              <motion.div
                whileHover={{ scale: 1.02, rotateX: 2 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900 md:p-8"
              >
                <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-start md:text-left">
                  <div className="rounded-full bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] p-[2px]">
                    <img src={item.avatar} alt={item.name} className="h-16 w-16 rounded-full object-cover" />
                  </div>

                  <div>
                    <FaQuoteLeft className="mb-3 animate-pulse text-xl text-cyan-500" />
                    <div className="mb-2 flex justify-center gap-1 md:justify-start">
                      {[...Array(5)].map((_, index) => (
                        <FaStar key={`${item.name}-star-${index}`} className="animate-pulse text-amber-400" />
                      ))}
                    </div>
                    <p className="text-base text-slate-600 dark:text-slate-300">"{item.quote}"</p>
                    <p className="mt-4 text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section
        className="relative my-8 overflow-hidden py-20"
        style={{
          backgroundImage: `linear-gradient(115deg, rgba(59,130,246,0.8), rgba(139,92,246,0.72), rgba(6,182,212,0.72)), url(${CTA_BG_URL})`,
          backgroundSize: "200% 200%, cover",
          backgroundPosition: "center",
          animation: "gradientMove 12s ease infinite",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/20" />

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto max-w-7xl px-4 text-center text-white sm:px-6 lg:px-8"
          data-aos="fade-up"
        >
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to Modernize Campus Operations?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-100">
            Launch unified workflows for facilities, bookings, incidents, and communication today.
          </p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100">
            Early Access Closes In {countdownLabel}
          </p>

          <div className="mx-auto mt-8 inline-flex rounded-xl bg-[length:200%_200%] p-[1px] animate-gradient bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#8b5cf6]">
            <RippleButton
              onClick={() => goToRoute("/login")}
              className="group rounded-xl bg-white px-7 py-3 text-sm font-bold text-cyan-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(255,255,255,0.55)]"
            >
              <FaCogs className="transition-transform duration-300 group-hover:rotate-90" />
              Start Free Pilot
              <FaGem className="transition-transform duration-300 group-hover:scale-125" />
            </RippleButton>
          </div>
        </motion.div>
      </section>

      <style>
        {`
          html { scroll-behavior: smooth; }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          @keyframes gradientMove {
            0% { background-position: 0% 50%, center; }
            50% { background-position: 100% 50%, center; }
            100% { background-position: 0% 50%, center; }
          }
          @keyframes ripple {
            from { transform: scale(0); opacity: 0.7; }
            to { transform: scale(2.5); opacity: 0; }
          }
          .animate-ripple {
            animation: ripple 0.6s linear;
          }
          .animate-gradient {
            animation: gradientMove 8s ease infinite;
          }
        `}
      </style>
    </motion.div>
  );
};

export default HomePage;
