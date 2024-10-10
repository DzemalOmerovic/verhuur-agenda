import {
  type NewActivityLog,
  type ActivityType,
  activityLogs,
} from "@/lib/db/schema";

import { createClient } from "@/lib/supabase/client";

export async function logActivity(
  teamId: number | null | undefined,
  userId: string,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    user_id: userId,
    action: type,
    ipAddress: ipAddress || '',
  };

  const supabase = createClient();
  await supabase.from('activity_logs').insert(newActivity);
}
