import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ConnectWallet from "@/components/wallet/ConnectWallet";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Transfer", path: "/transfer" },
    { name: "Swap", path: "/swap" },
    { name: "Auction", path: "/auction" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
            >
              <span className="text-primary-foreground font-semibold">TH</span>
            </motion.div>
            <motion.h1
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl font-semibold tracking-tight"
            >
              TokenHaven
            </motion.h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item, i) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={
                    location.pathname === item.path ? "secondary" : "ghost"
                  }
                  size="sm"
                  className="relative"
                >
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-secondary rounded-md"
                      transition={{
                        duration: 0.2,
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
