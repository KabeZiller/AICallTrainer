import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';

export default function LeaderboardPage() {
  const navigate = useNavigate();

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await analyticsApi.getLeaderboard();
      return response.data;
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="h-6 w-6 flex items-center justify-center text-sm font-bold">{rank}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
          ← Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Leaderboard</CardTitle>
            <CardDescription>See how you rank against other callers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard?.map((entry: any) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getRankIcon(entry.rank)}
                    <div>
                      <div className="font-semibold">{entry.email}</div>
                      <div className="text-sm text-gray-600">{entry.total_calls} calls</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {entry.avg_score.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">avg score</div>
                  </div>
                </div>
              ))}

              {(!leaderboard || leaderboard.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No data available yet. Start making calls to appear on the leaderboard!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

