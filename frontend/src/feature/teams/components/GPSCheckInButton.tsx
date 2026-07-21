import { useState, useCallback } from "react";
import { Navigation, Loader2, CheckCircle2 } from "lucide-react";
import { teamsApi } from "../services/teams.api";
import { useAppSelector } from "../../../stores/hooks";
import { selectCurrentUser } from "../../auth/services/auth.selectors";

interface GPSCheckInButtonProps {
  className?: string;
  variant?: "icon" | "full";
}

export const GPSCheckInButton = ({ className = "", variant = "full" }: GPSCheckInButtonProps) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const userTeamId = (currentUser as any)?.teamId as string | undefined;

  const [checkInStatus, setCheckInStatus] = useState<"idle" | "loading" | "success" | "error" | "no_gps" | "no_team">("idle");

  const handleCheckIn = useCallback(async () => {
    if (!userTeamId) {
      setCheckInStatus("no_team");
      setTimeout(() => setCheckInStatus("idle"), 4000);
      return;
    }
    if (!navigator.geolocation) {
      setCheckInStatus("no_gps");
      setTimeout(() => setCheckInStatus("idle"), 4000);
      return;
    }
    
    setCheckInStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await teamsApi.checkIn({
            teamId: userTeamId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setCheckInStatus("success");
          setTimeout(() => setCheckInStatus("idle"), 4000);
        } catch {
          setCheckInStatus("error");
          setTimeout(() => setCheckInStatus("idle"), 4000);
        }
      },
      () => {
        setCheckInStatus("error");
        setTimeout(() => setCheckInStatus("idle"), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [userTeamId]);

  const isIcon = variant === "icon";

  const getButtonStyles = () => {
    const base = "inline-flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl transition-all shadow-sm ";
    const padding = isIcon ? "p-2 sm:p-2.5" : "px-3 py-2";
    
    if (checkInStatus === "success") {
      return base + padding + " bg-emerald-100 text-emerald-700 border border-emerald-200";
    }
    if (checkInStatus === "error" || checkInStatus === "no_gps" || checkInStatus === "no_team") {
      return base + padding + " bg-rose-50 text-rose-600 border border-rose-200";
    }
    return base + padding + " bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300";
  };

  const getIcon = () => {
    if (checkInStatus === "loading") return <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />;
    if (checkInStatus === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (checkInStatus === "no_team" || checkInStatus === "no_gps" || checkInStatus === "error") return <Navigation className="w-4 h-4 text-rose-500" />;
    return <Navigation className="w-4 h-4 text-emerald-600" />;
  };

  const getText = () => {
    if (checkInStatus === "loading") return "Localisation...";
    if (checkInStatus === "success") return "Position envoyée";
    if (checkInStatus === "no_team") return "Aucune équipe";
    if (checkInStatus === "no_gps" || checkInStatus === "error") return "Erreur GPS";
    return "Signaler ma position";
  };

  return (
    <button
      onClick={handleCheckIn}
      disabled={checkInStatus === "loading"}
      className={`${getButtonStyles()} ${className}`}
      title="Partager ma position GPS"
    >
      {getIcon()}
      {!isIcon && <span className="hidden sm:inline">{getText()}</span>}
    </button>
  );
};
