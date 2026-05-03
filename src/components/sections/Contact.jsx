import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import { Send, MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const ContactBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Starburst / spoke dot grid */}
    <div
      className="absolute inset-0 opacity-[0.2] dark:opacity-[0.1]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #f0abfc 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    />

    {/* Deep indigo/magenta centre bloom */}
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.28, 0.38, 0.28] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[140px]"
      style={{
        background:
          "radial-gradient(ellipse, #7c3aed 0%, #db2777 60%, transparent 100%)",
      }}
    />

    {/* Warm pink orb — top right */}
    <motion.div
      animate={{ y: [0, -50, 0], x: [0, -30, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-[100px] opacity-25 dark:opacity-14"
      style={{ background: "radial-gradient(circle, #f472b6, #a78bfa)" }}
    />

    {/* Indigo orb — bottom left */}
    <motion.div
      animate={{ y: [0, 45, 0], x: [0, 25, 0], scale: [1, 1.08, 1] }}
      transition={{
        duration: 24,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 5,
      }}
      className="absolute -bottom-28 -left-28 w-[460px] h-[460px] rounded-full blur-[110px] opacity-20 dark:opacity-10"
      style={{ background: "radial-gradient(circle, #6366f1, #8b5cf6)" }}
    />

    {/* Animated ring pulse — centre */}
    <motion.div
      animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.12, 0, 0.12] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeOut" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-purple-400/20"
    />
    <motion.div
      animate={{ scale: [0.6, 1.6, 0.6], opacity: [0.1, 0, 0.1] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeOut", delay: 2 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-pink-400/15"
    />
  </div>
);

const ContactInfo = ({ icon, title, value, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 + 0.3 }}
    className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors group cursor-default"
  >
    <div className="p-4 rounded-2xl bg-primary-500/10 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-3 shadow-sm shadow-primary-500/20">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-gray-900 dark:text-white text-lg">
        {title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">
        {value}
      </p>
    </div>
  </motion.div>
);

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const formItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#0ea5e9",
      });
      return;
    }

    setIsSubmitting(true);

    const serviceId = "service_oi8rvmm";
    const templateId = "template_qq1tzd2";
    const publicKey = "Zr73TqcotdHs3aPN1";

    const templateParam = {
      from_name: formData.name,
      from_email: formData.email,
      to_name: "Soham Tarabada",
      message: `Subject: ${formData.subject}\n\n${formData.message}`,
    };

    emailjs
      .send(serviceId, templateId, templateParam, publicKey)
      .then((response) => {
        console.log("Email sent successfully!", response);
        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: "Message sent successfully!",
          confirmButtonColor: "#0ea5e9",
        });
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 3000);
      })
      .catch((error) => {
        console.error("Error sending email!", error);
        Swal.fire({
          icon: "error",
          title: "Send Failed",
          text: "Failed to send message. Please try again.",
          confirmButtonColor: "#0ea5e9",
        });
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <ContactBg />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <SectionHeading title="Get In Touch" subtitle="Contact" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-black dark:text-white mb-6 leading-tight"
              >
                Let's build something{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">
                  amazing
                </span>{" "}
                together
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-md"
              >
                I'm currently looking for new opportunities and my inbox is
                always open. Whether you have a question, a project proposal, or
                just want to say hi, I'll try my best to get back to you!
              </motion.p>
            </div>

            <div className="space-y-2 pt-6 border-t border-gray-200 dark:border-white/10">
              <ContactInfo
                index={0}
                icon={<Mail size={24} />}
                title="Email"
                value="sohamtarabada2003@gmail.com"
              />
              <ContactInfo
                index={1}
                icon={<Phone size={24} />}
                title="Phone"
                value="+91 87995 35382"
              />
              <ContactInfo
                index={2}
                icon={<MapPin size={24} />}
                title="Location"
                value="Vadodara, Gujarat"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={formContainerVariants}
            className="glass p-10 rounded-3xl relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300 ml-1"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-gray-200/50 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-black/60 transition-all dark:text-white shadow-sm"
                  placeholder="John Doe"
                />
              </motion.div>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300 ml-1"
                >
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-gray-200/50 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-black/60 transition-all dark:text-white shadow-sm"
                  placeholder="john@example.com"
                />
              </motion.div>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="subject"
                  className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300 ml-1"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  autoComplete="off"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-gray-200/50 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-black/60 transition-all dark:text-white shadow-sm"
                  placeholder="Project Discussion"
                />
              </motion.div>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="message"
                  className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300 ml-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  autoComplete="off"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-gray-200/50 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-black/60 transition-all resize-none dark:text-white shadow-sm"
                  placeholder="How can I help you?"
                ></textarea>
              </motion.div>
              <motion.div variants={formItemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || submitted}
                  className={`w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg text-white ${
                    submitted
                      ? "bg-green-500 shadow-green-500/30"
                      : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/30"
                  } disabled:opacity-80 disabled:cursor-not-allowed`}
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, rotate: 360 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          repeat: Infinity,
                          ease: "linear",
                          duration: 1,
                        }}
                        className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                      />
                    ) : submitted ? (
                      <motion.div
                        key="success"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        Sent Successfully <CheckCircle2 size={20} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        Send Message
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
