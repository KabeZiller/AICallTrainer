import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scriptsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function ScriptsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: scripts } = useQuery({
    queryKey: ['scripts'],
    queryFn: async () => {
      const response = await scriptsApi.getAll();
      return response.data;
    },
  });

  const createScriptMutation = useMutation({
    mutationFn: () => scriptsApi.create(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
      setTitle('');
      setContent('');
      alert('Script created successfully! Personas are being generated...');
    },
    onError: () => {
      alert('Failed to create script');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createScriptMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
          ← Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Script Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Script</CardTitle>
              <CardDescription>
                AI will automatically generate 3 personas (Easy, Medium, Hard) for this script
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Script Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., SaaS Product Cold Call"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Script Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your cold call script here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={15}
                    required
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createScriptMutation.isPending}
                >
                  {createScriptMutation.isPending ? 'Creating...' : 'Create Script'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Scripts */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Scripts</CardTitle>
              <CardDescription>Manage your cold call scripts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scripts?.map((script: any) => (
                  <Card key={script.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{script.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {script.content}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">
                        {script.personas?.length || 0} personas generated
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!scripts || scripts.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No scripts yet. Create your first script to get started!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

