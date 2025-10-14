import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { scriptsApi, analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Phone, TrendingUp, Target } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { data: scripts } = useQuery({
    queryKey: ['scripts'],
    queryFn: async () => {
      const response = await scriptsApi.getAll();
      return response.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const response = await analyticsApi.getUserStats();
      return response.data;
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Call Trainer</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" onClick={() => navigate('/leaderboard')}>
              Leaderboard
            </Button>
            {user?.role === 'admin' && (
              <Button variant="outline" onClick={() => navigate('/scripts')}>
                Manage Scripts
              </Button>
            )}
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_calls || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avg_score?.toFixed(1) || '0.0'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.recent_improvement > 0 ? '+' : ''}
                {stats?.recent_improvement?.toFixed(1) || '0.0'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.achievements?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Scripts */}
        <Card>
          <CardHeader>
            <CardTitle>Available Scripts</CardTitle>
            <CardDescription>Select a script to start practicing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scripts?.map((script: any) => (
                <Card key={script.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{script.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{script.content}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {script.personas?.map((persona: any) => (
                          <Badge key={persona.id} className={getDifficultyColor(persona.difficulty)}>
                            {persona.difficulty}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/call/${script.id}`)}
                      >
                        Start Practice Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!scripts || scripts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No scripts available yet.</p>
                {user?.role === 'admin' && (
                  <Button className="mt-4" onClick={() => navigate('/scripts')}>
                    Create First Script
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

