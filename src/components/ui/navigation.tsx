import { Link } from "react-router-dom";
import { Logo } from "@/components/navigation/Logo";
import { NavLinks } from "@/components/navigation/NavLinks";
import { UserMenu } from "@/components/navigation/UserMenu";
import { useNavigation } from "@/hooks/useNavigation";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const {
    userId,
    isAdmin,
    hasPurchased,
    hideNavLinks,
    handleSignOut,
  } = useNavigation();

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex-shrink-0">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        {!hideNavLinks && <NavLinks />}
        <div className="flex items-center gap-2">
          {!userId ? (
            <Link
              to="/signin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Sign in
            </Link>
          ) : (
            <>
              {hasPurchased && !hideNavLinks && (
                <Link to="/gat">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
              {isAdmin && !hideNavLinks && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <UserMenu
                isAdmin={isAdmin}
                hasPurchased={hasPurchased}
                hideNavLinks={hideNavLinks}
                handleSignOut={handleSignOut}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};