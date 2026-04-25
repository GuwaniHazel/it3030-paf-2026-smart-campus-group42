import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaArrowRight,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPhoneAlt,
  FaQuestionCircle,
  FaSpinner,
  FaTwitter,
  FaWhatsapp,
  FaChevronDown,
  FaClock,
  FaBell,
} from "react-icons/fa";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&auto=format";
const MAP_IMAGE_URL =
  "https://maps.googleapis.com/maps/api/staticmap?center=Colombo,Sri+Lanka&zoom=13&size=1200x500&key=YOUR_API_KEY";

const faqItems = [
  {
    question: "How do I book a resource?",
    answer:
      "Use the Booking Management section from your dashboard, choose an available resource, and submit your request for approval.",
    icon: FaPaperPlane,
  },
  {
    question: "How to report an incident?",
    answer:
      "Open the Incident Tickets module, provide a short description, attach any relevant details, and submit the ticket for review.",
    icon: FaBell,
  },
  {
    question: "What are the working hours?",
    answer:
      "Our support team is available Monday to Friday from 8:00 AM to 6:00 PM, with emergency coverage outside these hours.",
    icon: FaClock,
  },
  {
    question: "How to get admin access?",
    answer:
      "Admin access is assigned by authorized campus coordinators. Please contact the system administrator with your details.",
    icon: FaQuestionCircle,
  },
];

const supportHours = [
  { label: "General Support", value: "Mon-Fri, 8:00 AM - 6:00 PM" },
  { label: "Technical Support", value: "Mon-Fri, 9:00 AM - 5:00 PM" },
  { label: "Emergency Help", value: "24/7 for urgent campus incidents" },
];

const socialLinks = [
  { label: "Facebook", icon: FaFacebookF, href: "#" },
  { label: "Twitter", icon: FaTwitter, href: "#" },
  { label: "LinkedIn", icon: FaLinkedinIn, href: "#" },
  { label: "Instagram", icon: FaInstagram, href: "#" },
];

const initialForm = {
  fullName: "",
  email: "",
  subject: "General Inquiry",
  message: "",
};

const ContactUsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [showMapImage, setShowMapImage] = useState(true);

  const { ref: formRef, inView: formInView } = useInView({ threshold: 0.2, triggerOnce: true });
  const { ref: infoRef, inView: infoInView } = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (location.hash === "#contact-form") {
      const target = document.getElementById("contact-form");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const subjectOptions = useMemo(
    () => ["General Inquiry", "Support", "Booking Issue", "Feedback"],
    []
  );

  const validate = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.subject) {
      nextErrors.subject = "Please choose a subject.";
    }

    if (!formData.message.trim()) {
      nextErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 20) {
      nextErrors.message = "Message should be at least 20 characters long.";
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setFormData(initialForm);
      setToast("Message sent successfully. We'll get back to you soon.");
    }, 1600);
  };

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) {
      setNewsletterMessage("Please enter a valid email address.");
      return;
    }

    setNewsletterMessage("Subscribed successfully. Thank you for staying connected.");
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {toast ? (
        <div className="fixed right-4 top-4 z-[60] rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-xl dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {toast}
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/75" />

        <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-cyan-100 backdrop-blur-md">
              <FaEnvelope className="text-cyan-300" />
              Contact Smart Campus Hub
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Get In Touch
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
              We&apos;d love to hear from you. Reach out anytime.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-2px] hover:shadow-lg hover:shadow-cyan-500/30"
              >
                Send Message
                <FaArrowRight className="text-xs" />
              </button>
              
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            id="contact-form"
            ref={formRef}
            initial={{ opacity: 0, x: -40 }}
            animate={formInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_60px_rgba(2,6,23,0.35)] sm:p-8"
            data-aos="fade-up"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold md:text-3xl">Send us a message</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Fill in the form and our team will respond with the right support.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 dark:placeholder:text-slate-500 ${
                    errors.fullName ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.fullName ? <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p> : null}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 dark:placeholder:text-slate-500 ${
                    errors.email ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.email ? <p className="mt-1 text-xs text-rose-500">{errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition focus:border-cyan-500 dark:bg-slate-900 ${
                    errors.subject ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {subjectOptions.map((option) => (
                    <option key={option} value={option} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                      {option}
                    </option>
                  ))}
                </select>
                {errors.subject ? <p className="mt-1 text-xs text-rose-500">{errors.subject}</p> : null}
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you"
                  className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 dark:placeholder:text-slate-500 ${
                    errors.message ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {errors.message ? <p className="mt-1 text-xs text-rose-500">{errors.message}</p> : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                {isSubmitting ? "Sending Message..." : "Submit Message"}
              </button>
            </form>
          </motion.div>

          <motion.aside
            ref={infoRef}
            initial={{ opacity: 0, x: 40 }}
            animate={infoInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6"
            data-aos="fade-up"
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-2xl font-bold">Contact Information</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <FaMapMarkerAlt />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Address</p>
                    <p>Smart Campus Hub, Colombo, Sri Lanka</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <FaEnvelope />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Email</p>
                    <p>hub@smartcampus.edu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <FaPhoneAlt />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Phone</p>
                    <p>+94 11 234 5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <FaClock />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Working Hours</p>
                    <p>Mon-Fri, 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/94112345678"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  <FaWhatsapp />
                  WhatsApp Us
                </a>
                <a
                  href="mailto:hub@smartcampus.edu"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-200"
                >
                  <FaEnvelope />
                  Email Support
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-bold">Follow Us</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      aria-label={item.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-cyan-400"
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-bold">Support Hours</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {supportHours.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.label}</p>
                      <p>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50 px-4 py-3 text-sm text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200">
                Emergency contact: +94 11 234 5678
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Map */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl" data-aos="fade-up">
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800">
            {showMapImage ? (
              <img
                src={MAP_IMAGE_URL}
                alt="Map placeholder for Colombo, Sri Lanka"
                className="h-[360px] w-full object-cover"
                onError={() => setShowMapImage(false)}
              />
            ) : (
              <iframe
                title="Smart Campus Hub map"
                src="https://www.google.com/maps?q=Colombo%2C%20Sri%20Lanka&z=13&output=embed"
                className="h-[360px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </section>

      {/* FAQ and Newsletter */}
      <section className="bg-slate-50 px-4 py-16 dark:bg-slate-900 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div data-aos="fade-up">
            <div className="mb-8">
              <h2 className="text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Quick answers to the most common questions.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => {
                const Icon = item.icon;
                const open = expandedFaq === index;

                return (
                  <div key={item.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(open ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="flex items-center gap-3 font-semibold text-slate-900 dark:text-white">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                          <Icon />
                        </span>
                        {item.question}
                      </span>
                      <FaChevronDown className={`text-slate-500 transition ${open ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden px-5 pb-4 text-sm text-slate-600 dark:text-slate-300">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6" data-aos="fade-up">
            <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-[0_20px_60px_rgba(8,145,178,0.35)]">
              <h3 className="text-2xl font-bold">Newsletter Signup</h3>
              <p className="mt-2 text-sm text-cyan-50">
                Get product updates, announcements, and support highlights.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="mt-5 space-y-3">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-4 py-3 text-sm text-white placeholder:text-cyan-100 outline-none backdrop-blur-md transition focus:bg-white/20"
                />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Subscribe
                </button>
              </form>
              {newsletterMessage ? <p className="mt-3 text-sm text-cyan-50">{newsletterMessage}</p> : null}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xl font-bold">Need urgent help?</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                For urgent incidents, contact our support desk immediately for faster escalation.
              </p>
              <a
                href="tel:+94112345678"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                <FaPhoneAlt />
                +94 11 234 5678
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;
