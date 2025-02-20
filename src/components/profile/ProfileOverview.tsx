
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "@/components/ui/optimized-image/OptimizedImage";
import { Button } from "@/components/ui/button";

type ProfileOverviewProps = {
  profile: any;
  statistics: any[];
};

export function ProfileOverview({ profile, statistics }: ProfileOverviewProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  const totalQuestions = statistics?.reduce((acc, stat) => acc + (stat.questions_answered || 0), 0) || 0;
  const correctAnswers = statistics?.reduce((acc, stat) => acc + (stat.correct_answers || 0), 0) || 0;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Calculate mastery progress
  const masteryThreshold = 800; // Consider a topic mastered when score is above 800
  const masteredTopics = statistics?.filter(stat => (stat.current_score || 0) >= masteryThreshold).length || 0;
  const totalTopics = statistics?.length || 0;
  const masteryProgress = totalTopics > 0 ? (masteredTopics / totalTopics) * 100 : 0;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200">
            {profile?.avatar_url ? (
              <OptimizedImage
                src={profile.avatar_url}
                alt={profile?.username || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <span className="text-2xl text-gray-400">
                  {profile?.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => document.getElementById('profile-image-input')?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
          </Button>
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile?.username || "User"}</h1>
          <p className="text-muted-foreground">
            Member since {new Date(profile?.created_at).toLocaleDateString()}
          </p>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-medium">{profile?.streak_days || 0} day streak</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div>
              <span className="font-medium">{Math.round(accuracy)}% accuracy</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between text-sm">
          <span>Topic Mastery</span>
          <span>{masteredTopics} / {totalTopics} topics mastered</span>
        </div>
        <Progress 
          value={masteryProgress} 
          className="mt-2"
        />
        {masteryProgress === 100 && (
          <p className="text-sm text-green-600 mt-1">Congratulations! You've mastered all topics!</p>
        )}
      </div>
    </Card>
  );
}
