import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type UserSettingsProps = {
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    username: string | null;
  } | null;
};

export const UserSettings = ({ profile }: UserSettingsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      username: profile?.username || "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", profile?.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || ""}
            disabled
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            {...register("full_name")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            {...register("username")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register("phone")}
          />
        </div>

        <Button 
          type="submit" 
          disabled={!isDirty || isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Card>
  );
};