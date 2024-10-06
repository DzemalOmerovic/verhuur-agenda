"use client"

import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface TeamMember {
  id: number;
  user_id: string;
  team_id: number;
  role: string;
  email?: string;
}

export default function TeamManagement({ userId }: { userId: string }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchTeamIdAndMembers();

    console.log(teamMembers)
  }, [userId]);

  const fetchTeamIdAndMembers = async () => {
    // First, fetch the team ID for the current user
    const { data: teamMemberData, error: teamMemberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .single();

    if (teamMemberError) {
      console.error('Error fetching team ID:', teamMemberError);
      return;
    }

    if (teamMemberData) {
      setTeamId(teamMemberData.team_id);
      
      // Now fetch all team members for this team
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          team_id,
          role
        `)
        .eq('team_id', teamMemberData.team_id);

      if (membersError) {
        console.error('Error fetching team members:', membersError);
      } else if (membersData) {
        // Fetch email addresses for all team members
        const emailPromises = membersData.map(member => 
          supabase.auth.getUser()
        );
        const emailResults = await Promise.all(emailPromises);
        
        const membersWithEmail = membersData.map((member, index) => ({
          ...member,
          email: emailResults[index].data.user?.email
        }));

        setTeamMembers(membersWithEmail);
        const currentUserData = membersWithEmail.find(member => member.user_id === userId);
        if (currentUserData) {
          setCurrentUser(currentUserData);
        }
      }

      // Fetch team name
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamMemberData.team_id)
        .single();

      if (teamError) {
        console.error('Error fetching team name:', teamError);
      } else if (teamData) {
        setTeamName(teamData.name);
      }
    }
  };

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    const { data, error } = await supabase
      .from('invitations')
      .insert([
        { 
          team_id: teamId,
          email: newMemberEmail, 
          role: newMemberRole,
          invited_by: userId
        }
      ]);

    if (error) {
      console.error('Error adding team member:', error);
    } else {
      setNewMemberEmail('');
      setNewMemberRole('member');
      // Optionally, you can show a success message here
    }
  };

  const changeTeamName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    const { data, error } = await supabase
      .from('teams')
      .update({ name: newTeamName })
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team name:', error);
    } else {
      setTeamName(newTeamName);
      setNewTeamName('');
      // Optionally, you can show a success message here
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Team Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser && (
            <div className="flex items-center space-x-6 bg-gray-100 p-4 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <span className="text-2xl font-bold">
                  {currentUser.email?.[0].toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800">{currentUser.email || 'No email'}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.filter(member => member.user_id !== userId).map((member) => (
            <div key={member.id} className="flex items-center space-x-4 mb-4">
              <Avatar>
                <AvatarFallback>{member.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.email || 'No email'}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTeamMember} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Role</Label>
              <RadioGroup 
                defaultValue="member" 
                onValueChange={setNewMemberRole}
                className="flex space-x-4"
              >
                <div className={`flex-1 flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors duration-200 ${newMemberRole === 'member' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                  <RadioGroupItem value="member" id="member" />
                  <Label htmlFor="member" className="flex-grow cursor-pointer">
                    <span className="font-medium">Member</span>
                    <p className="text-xs text-gray-500">Can view and edit car reservations</p>
                  </Label>
                </div>
                <div className={`flex-1 flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors duration-200 ${newMemberRole === 'owner' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                  <RadioGroupItem value="owner" id="owner" />
                  <Label htmlFor="owner" className="flex-grow cursor-pointer">
                    <span className="font-medium">Owner</span>
                    <p className="text-xs text-gray-500">Full access to manage team and settings</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full">
              Invite Member
            </Button>
          </form>
        </CardContent>
      </Card>

      {currentUser && currentUser.role === 'owner' && (
        <Card>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changeTeamName} className="space-y-4">
              <div>
                <Label htmlFor="teamName" className="text-sm font-medium">Team Name</Label>
                <Input
                  id="teamName"
                  type="text"
                  placeholder="Enter new team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  required
                  className="w-full mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Update Team Name
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}