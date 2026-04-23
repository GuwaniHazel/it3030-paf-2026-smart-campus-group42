import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaArrowRight,
  FaReact,
  FaGithub,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaJava,
  FaDatabase,
  FaCss3Alt,
} from "react-icons/fa";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&auto=format";
const STORY_IMAGE_URL =
  "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format";
const CTA_BG_URL =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&auto=format";

// Team members data
const teamMembers = [
  {
    //name: "Sarah Anderson",
    role: "Project Lead - Module A",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    //name: "John Smith",
    role: "Backend Lead - Module B",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    //name: "Emily Chen",
    role: "UI/UX Designer - Module C",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    //name: "Michael Johnson",
    role: "DevOps Lead - Module D",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
];

// Stats data
const stats = [
  { label: "Years of Experience", value: 5, suffix: "+" },
  { label: "Active Users", value: 5000, suffix: "+" },
  { label: "Resources Managed", value: 50, suffix: "+" },
  { label: "Tickets Resolved", value: 1000, suffix: "+" },
];

// Technology stack
const technologies = [
  { name: "React", icon: FaReact, color: "text-blue-400" },
  { name: "Java/Spring", icon: FaJava, color: "text-orange-500" },
  { name: "Tailwind CSS", icon: FaCss3Alt, color: "text-cyan-400" },
  { name: "MySQL", icon: FaDatabase, color: "text-orange-600" },
  { name: "GitHub", icon: FaGithub, color: "text-slate-400" },
];

// Animated counter component
const AnimatedCounter = ({ value, suffix }) => {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const end = value;
    const duration = 2000;
    const incrementTime = duration / end;

    const timer = setInterval(() => {
      start++;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
        {count}
        {suffix}
      </div>
    </div>
  );
};

// Team member card component
const TeamCard = ({ member }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="group overflow-hidden rounded-lg shadow-lg dark:shadow-slate-900/50"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {/* Image container */}
        <div className="relative h-80 overflow-hidden">
          <motion.img
            src={member.image}
            alt={member.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="bg-white p-6 dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {member.name}
          </h3>
          <p className="mt-1 text-sm text-cyan-600 dark:text-cyan-400 font-medium">
            {member.role}
          </p>

          {/* Social icons */}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-cyan-400"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn className="text-xs" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-cyan-400"
              aria-label="Twitter"
            >
              <FaTwitter className="text-xs" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-cyan-400"
              aria-label="Instagram"
            >
              <FaInstagram className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function AboutUsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden md:h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        <div className="relative flex h-full items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl px-4"
          >
            <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              About Smart Campus Hub
            </h1>
            <p className="mt-4 text-lg text-slate-100 md:text-xl">
              Transforming campus operations through innovation
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="mb-12 text-center"
            data-aos="fade-up"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              Our Mission & Vision
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Guiding principles that drive our platform
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission Card */}
            <motion.div
              data-aos="fade-up-right"
              whileHover={{ y: -8 }}
              className="rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 p-8 shadow-lg dark:from-slate-800/50 dark:to-slate-800/30 dark:shadow-slate-900/50"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Our Mission
              </h3>
              <p className="mt-4 text-slate-700 dark:text-slate-300">
                Our mission is to revolutionize campus management by providing
                innovative, integrated solutions that streamline operations,
                enhance resource utilization, and create a seamless experience
                for administrators, staff, and students.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              data-aos="fade-up-left"
              whileHover={{ y: -8 }}
              className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow-lg dark:from-slate-800/50 dark:to-slate-800/30 dark:shadow-slate-900/50"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Our Vision
              </h3>
              <p className="mt-4 text-slate-700 dark:text-slate-300">
                To create a seamless digital ecosystem that empowers educational
                institutions with intelligent insights, automated workflows, and
                unified communication. We envision a future where campus
                operations are efficient, transparent, and student-centric.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-16 dark:from-slate-900 dark:to-slate-800 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Left side - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              data-aos="fade-right"
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                Our Story
              </h2>
              <p className="mt-4 text-slate-700 dark:text-slate-300">
                Smart Campus Hub was founded with a vision to address the
                operational challenges faced by educational institutions. Our
                team recognized the inefficiencies in campus management and set
                out to build a comprehensive solution.
              </p>
              <p className="mt-4 text-slate-700 dark:text-slate-300">
                Starting as a small project, we've grown to serve multiple
                institutions, managing thousands of resources and handling
                countless bookings and tickets. Our commitment to user
                experience and continuous innovation has made us the trusted
                partner for campus operations.
              </p>
              <p className="mt-4 text-slate-700 dark:text-slate-300">
                Today, Smart Campus Hub continues to evolve, incorporating
                cutting-edge technologies and best practices to deliver
                exceptional value to our users and partners.
              </p>

              {/* Timeline */}
              <div className="mt-8 space-y-4">
                {[
                  { year: "2021", event: "Platform founded" },
                  { year: "2022", event: "First institution onboarded" },
                  { year: "2023", event: "1000+ resources managed" },
                  { year: "2024", event: "5000+ active users" },
                  { year: "2025", event: "AI features launched" },
                ].map((milestone, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                      {idx < 4 && (
                        <div className="h-8 w-0.5 bg-gradient-to-b from-cyan-500 to-transparent" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-cyan-600 dark:text-cyan-400">
                        {milestone.year}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {milestone.event}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right side - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              data-aos="fade-left"
              className="relative"
            >
              <div className="overflow-hidden rounded-lg shadow-2xl">
                <motion.img
                  src={STORY_IMAGE_URL}
                  alt="Campus story"
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -right-4 -bottom-4 h-40 w-40 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="mb-12 text-center"
            data-aos="fade-up"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Talented individuals dedicated to your success
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                data-aos="fade-up"
              >
                <TeamCard member={member} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="mb-12 text-center"
            data-aos="fade-up"
          >
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              By The Numbers
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Our impact and growth in numbers
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center backdrop-blur-sm"
                data-aos="zoom-in"
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                />
                <p className="mt-4 text-slate-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="mb-12 text-center"
            data-aos="fade-up"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              Built With Technology
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Modern stack for modern campus management
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, idx) => {
              const Icon = tech.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ duration: 0.3 }}
                  data-aos="fade-up"
                  data-aos-delay={idx * 50}
                >
                  <div className="group relative inline-flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-6 py-3 transition dark:border-slate-700 dark:bg-slate-800">
                    <Icon className={`h-5 w-5 ${tech.color}`} />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {tech.name}
                    </span>
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 opacity-0 blur-lg transition group-hover:opacity-100" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${CTA_BG_URL}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70" />

        {/* Content */}
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Ready to Transform Your Campus?
            </h2>
            <p className="mt-6 text-lg text-slate-100">
              Join thousands of institutions already benefiting from Smart Campus Hub.
              Experience seamless operations and enhanced collaboration today.
            </p>

            <motion.button
              type="button"
              onClick={() => navigate("/student")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/50"
            >
              Get Started
              <FaArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
