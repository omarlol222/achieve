import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/navigation/Logo";
import { NavLinks } from "@/components/navigation/NavLinks";
import { UserMenu } from "@/components/navigation/UserMenu";
import { Trophy } from "lucide-react";
import { Button } from "./button";
import { useNavigation } from "@/hooks/useNavigation";

export function Navigation({ hideNavLinks }: { hideNavLinks?: boolean }) {
  const location = useLocation();
  const isGatPage = location.pathname.startsWith('/gat');
  const { isAdmin, hasPurchased, handleSignOut } = useNavigation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          {!hideNavLinks && <NavLinks />}
        </div>

        <div className="flex items-center gap-4">
          {isGatPage ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/gat/leaderboard" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Link>
              </Button>
              <UserMenu 
                isAdmin={isAdmin} 
                hasPurchased={hasPurchased} 
                hideNavLinks={hideNavLinks || false} 
                handleSignOut={handleSignOut}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/gat">Dashboard</Link>
              </Button>
              <UserMenu 
                isAdmin={isAdmin} 
                hasPurchased={hasPurchased} 
                hideNavLinks={hideNavLinks || false} 
                handleSignOut={handleSignOut}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}