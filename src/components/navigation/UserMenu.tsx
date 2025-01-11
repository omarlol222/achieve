import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  isAdmin: boolean;
  hasPurchased: boolean;
  hideNavLinks: boolean;
  handleSignOut: () => Promise<void>;
}

export const UserMenu = ({ isAdmin, hasPurchased, hideNavLinks, handleSignOut }: UserMenuProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            Admin
          </DropdownMenuItem>
        )}
        {!hideNavLinks && (
          <>
            <DropdownMenuItem onClick={() => navigate("/about")}>
              About
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/shop")}>
              Shop
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/faq")}>
              FAQ
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={handleSignOut}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};