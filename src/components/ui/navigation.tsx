import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/navigation/Logo";
import { Button } from "./button";
import { useNavigation } from "@/hooks/useNavigation";

export function Navigation({ hideNavLinks }: { hideNavLinks?: boolean }) {
  const location = useLocation();
  const { handleSignOut, userId } = useNavigation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Logo />
        {userId ? (
          <Button variant="ghost" onClick={handleSignOut}>
            Log out
          </Button>
        ) : (
          <Button variant="ghost" asChild>
            <Link to="/signin">Log in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}