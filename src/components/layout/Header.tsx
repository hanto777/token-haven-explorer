import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Transfer', path: '/transfer' },
    { name: 'Swap', path: '/swap' },
  ];

  const onNavItemClick = () => {
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-0 md:px-6 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="px-5 md:px-20 mx-auto font-telegraf">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex mr-5 md:mr-24 items-center space-x-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-primary flex items-center justify-center"
            >
              <img src="/assets/zama-logo.png" alt="Zama" className="w-6 h-6" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={
                    location.pathname === item.path ? 'secondary' : 'ghost'
                  }
                  size="sm"
                  className="relative hover:bg-slate-500"
                >
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-secondary"
                      transition={{
                        duration: 0.2,
                        type: 'spring',
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

          <div className="flex items-center gap-2">
            <ConnectWallet />
            <ThemeToggle />

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-[40vh] pt-16">
                  <div className="mt-4 flex flex-col items-center gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onNavItemClick}
                        className="w-full max-w-xs"
                      >
                        <Button
                          variant={
                            location.pathname === item.path
                              ? 'secondary'
                              : 'ghost'
                          }
                          className="w-full justify-left font-telegraf text-lg text-left py-6 hover:bg-gray-300"
                        >
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                    {/* <div className="mt-4 flex justify-center w-full max-w-xs">
                      <ConnectWallet />
                    </div> */}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
