import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";
import { FaInstagram, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-scroll";

const socialLinks = [
  {
    icon: Github,
    href: "https://github.com/soham-tarabada",
    label: "GitHub",
    isLucide: true,
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/soham-tarabada-51a50020b",
    label: "LinkedIn",
    isLucide: true,
  },
  {
    icon: Mail,
    href: "mailto:sohamtarabada2003@gmail.com",
    label: "Email",
    isLucide: true,
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/_soham9898/",
    label: "Instagram",
    isLucide: false,
  },
  {
    icon: FaTelegramPlane,
    href: "https://t.me/soham9898",
    label: "Telegram",
    isLucide: false,
  },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/918799535382",
    label: "WhatsApp",
    isLucide: false,
  },
];

const Footer = () => {
  return (
    <footer className="bg-light-bg dark:bg-dark-bg border-t border-light-border dark:border-dark-border py-12 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold mb-2">Soham Tarabada</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Full Stack Developer building scalable applications
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                whileHover={{ y: -3 }}
                href={social.href}
                target={social.href.startsWith("mailto") ? undefined : "_blank"}
                rel={
                  social.href.startsWith("mailto")
                    ? undefined
                    : "noopener noreferrer"
                }
                aria-label={social.label}
                className="p-2 rounded-full glass hover:text-primary-500 transition-colors"
              >
                <social.icon size={20} />
              </motion.a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-light-border dark:border-dark-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Soham Tarabada. All rights
            reserved.
          </p>
          <Link
            to="home"
            smooth={true}
            duration={500}
            className="flex items-center gap-2 cursor-pointer hover:text-primary-500 transition-colors"
          >
            Back to top <ArrowUp size={16} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
