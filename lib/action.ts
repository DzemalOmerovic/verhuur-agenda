import { createClient } from "@/lib/supabase/server";

export async function getTeamName(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching team name:', error);
    return null;
  }

  const teamId = data[0].team_id;

  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('name')
    .eq('id', teamId);

  if (teamError) {
    console.error('Error fetching team name:', teamError);
    return null;
  }

  return teamData[0].name;
}
export async function getTeamID(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching team name:', error);
    return null;
  }

  return data[0].team_id;
}