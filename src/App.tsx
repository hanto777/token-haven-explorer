import { useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useChainId } from 'wagmi';
import { useTokenStore } from '@/stores/useTokenStore';
import { toast } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router/router';

function App() {
  const { isConnected } = useWallet();
  const chainId = useChainId();
  const { initializeTokens, setIsLoading } = useTokenStore();

  useEffect(() => {
    if (isConnected) {
      setIsLoading(true);
      try {
        initializeTokens(chainId);
      } catch (error) {
        console.error('Error initializing tokens:', error);
        toast.error('Failed to load token data');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isConnected, chainId, initializeTokens, setIsLoading]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
