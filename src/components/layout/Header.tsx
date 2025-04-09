
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import NetworkSwitcher from "@/components/wallet/NetworkSwitcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Header = () => {
  const location = useLocation();
  const { isConnected, openConnectModal, openAccountModal } = useWallet();

  const handleConnect = () => {
    if (!isConnected && openConnectModal) {
      openConnectModal();
    } else if (isConnected && openAccountModal) {
      openAccountModal();
    }
  };

  // Define our navigation groups
  const portfolioLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Transfer", path: "/transfer" },
    { name: "Swap", path: "/swap" },
  ];

  const auctionLinks = [
    { name: "Auctions", path: "/auctions" },
    { name: "Deploy", path: "/deploy-auction" },
  ];

  // Check which section we're in
  const isPortfolioSection = portfolioLinks.some((link) => link.path === location.pathname);
  const isAuctionSection = auctionLinks.some((link) => link.path === location.pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">dApp</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <div className="flex items-center space-x-2 mr-6">
              <div className="font-semibold text-sm text-muted-foreground">Portfolio:</div>
              {portfolioLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    location.pathname === link.path
                      ? "text-foreground font-semibold"
                      : "text-foreground/60"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <div className="font-semibold text-sm text-muted-foreground">Auctions:</div>
              {auctionLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    location.pathname === link.path
                      ? "text-foreground font-semibold"
                      : "text-foreground/60"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Mobile menu button */}
            <Button variant="outline" size="sm" className="md:hidden">
              Menu
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <NetworkSwitcher />
            <ThemeToggle />
            <Button onClick={handleConnect} size="sm">
              {isConnected ? "Account" : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
