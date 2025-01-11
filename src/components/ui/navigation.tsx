import { Link } from "react-router-dom";
import { Logo } from "@/components/navigation/Logo";
import { NavLinks } from "@/components/navigation/NavLinks";
import { UserMenu } from "@/components/navigation/UserMenu";
import { useNavigation } from "@/hooks/useNavigation";

export const Navigation = () => {
  const {
    userId,
    isAdmin,
    hasPurchased,
    hideNavLinks,
    handleSignOut,
  } = useNavigation();

  if (!userId) {
    return (
      <nav className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/signin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center">
        <div className="w-[200px]">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        {!hideNavLinks && <NavLinks />}
        <div className="w-[200px] flex justify-end">
          <UserMenu
            isAdmin={isAdmin}
            hasPurchased={hasPurchased}
            hideNavLinks={hideNavLinks}
            handleSignOut={handleSignOut}
          />
        </div>
      </div>
    </nav>
  );
};