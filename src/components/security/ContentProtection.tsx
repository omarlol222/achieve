import React, { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";

type ContentProtectionProps = {
  children: React.ReactNode;
};

export const ContentProtection = ({ children }: ContentProtectionProps) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Prevent printing
    const handlePrint = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toast({
          variant: "destructive",
          title: "Printing is disabled",
          description: "For security reasons, printing this content is not allowed.",
        });
      }
    };

    // Prevent screenshots
    const handleScreenCapture = () => {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      
      toast({
        variant: "destructive",
        title: "Screenshot detected",
        description: "For security reasons, taking screenshots is not allowed.",
      });
    };

    // Listen for print attempts
    window.addEventListener('keydown', handlePrint);

    // Listen for screenshot attempts
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        handleScreenCapture();
      }
    });

    // Additional screenshot prevention for various OS shortcuts
    document.addEventListener('keydown', (e) => {
      if (
        (e.ctrlKey && (e.key === 'PrintScreen' || e.key === 'p' || e.key === 'P')) ||
        (e.metaKey && (e.shiftKey && e.key === '3' || e.shiftKey && e.key === '4'))
      ) {
        e.preventDefault();
        handleScreenCapture();
      }
    });

    return () => {
      window.removeEventListener('keydown', handlePrint);
      document.removeEventListener('keyup', () => {});
      document.removeEventListener('keydown', () => {});
    };
  }, []);

  return (
    <div 
      className="relative"
      // Prevent selection and right-click
      onContextMenu={(e) => e.preventDefault()}
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    >
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            Screenshot Detected! This content is protected.
          </div>
        </div>
      )}
      {children}
    </div>
  );
};