import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/navigation/Logo";
import { Button } from "./button";
import { useNavigation } from "@/hooks/useNavigation";

export function Navigation({ hideNavLinks }: { hideNavLinks?: boolean }) {
  const location = useLocation();
  const { handleSignOut } = useNavigation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Logo />
        <Button variant="ghost" onClick={handleSignOut}>
          Log out
        </Button>
      </div>
    </header>
  );
}