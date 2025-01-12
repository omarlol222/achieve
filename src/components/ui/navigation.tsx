import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/navigation/Logo";
import { Button } from "./button";
import { useNavigation } from "@/hooks/useNavigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Navigation({ hideNavLinks }: { hideNavLinks?: boolean }) {
  const location = useLocation();
  const { handleSignOut, userId } = useNavigation();

  // Only show nav links on specified pages
  const showNavLinks = ["/index", "/faq", "/about", "/shop"].includes(location.pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex-none">
          <Logo />
        </div>
        
        {showNavLinks && (
          <div className="flex-1 flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/about">
                    <Button variant="ghost">About</Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/faq">
                    <Button variant="ghost">FAQ</Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/shop">
                    <Button variant="ghost">Shop</Button>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}

        <div className="flex-none flex items-center gap-4">
          {userId && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                Log out
              </Button>
            </>
          )}
          {!userId && (
            <Button variant="ghost" asChild>
              <Link to="/signin">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}