import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ClientAccessState {
  hasClientAccess: boolean;
  loading: boolean;
  clientId: string | null;
}

export function useClientAccess(): ClientAccessState {
  const { user, loading: authLoading } = useAuth();
  const [hasClientAccess, setHasClientAccess] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkClientAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        setHasClientAccess(false);
        setClientId(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user email matches a client record
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();

        if (client) {
          setHasClientAccess(true);
          setClientId(client.id);
        } else {
          setHasClientAccess(false);
          setClientId(null);
        }

      } catch (error) {
        console.error("Error checking client access:", error);
        setHasClientAccess(false);
        setClientId(null);
      } finally {
        setLoading(false);
      }
    };

    checkClientAccess();
  }, [user, authLoading]);

  return { hasClientAccess, loading: loading || authLoading, clientId };
}