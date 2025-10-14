import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { scriptsApi, callsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

export default function CallPage() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([]);
  const [callFeedback, setCallFeedback] = useState<any>(null);
  const [currentCallId, setCurrentCallId] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { data: script } = useQuery({
    queryKey: ['script', scriptId],
    queryFn: async () => {
      const response = await scriptsApi.getById(parseInt(scriptId!));
      return response.data;
    },
  });

  const startCallMutation = useMutation({
    mutationFn: (personaId: number) => callsApi.start(personaId),
    onSuccess: (response) => {
      const callId = response.data.id;
      setCurrentCallId(callId);
      connectToRealtimeAPI(callId);
    },
  });

  const connectToRealtimeAPI = async (callId: number) => {
    const wsUrl = `ws://localhost:8000/calls/realtime/${callId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      console.log('WebSocket connected');
      setIsInCall(true);

      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          // Convert audio to base64 and send
          const reader = new FileReader();
          reader.readAsDataURL(event.data);
          reader.onloadend = () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            ws.send(JSON.stringify({
              type: 'audio',
              data: base64Audio
            }));
          };
        }
      };
      
      // Send audio chunks every 100ms
      mediaRecorder.start(100);
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'audio' && audioContextRef.current) {
        // Play received audio
        const audioData = atob(data.data);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        
        const audioBuffer = await audioContextRef.current.decodeAudioData(audioArray.buffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
      } else if (data.type === 'transcript') {
        setTranscript((prev) => [
          ...prev,
          { speaker: data.speaker, text: data.text }
        ]);
      } else if (data.type === 'call_complete') {
        setCallFeedback(data.analysis);
        setIsInCall(false);
        ws.close();
      } else if (data.type === 'error') {
        console.error('WebSocket error:', data.message);
        alert('Error: ' + data.message);
        setIsInCall(false);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsInCall(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsInCall(false);
    };
  };

  const startCall = (persona: any) => {
    setSelectedPersona(persona);
    setTranscript([]);
    setCallFeedback(null);
    startCallMutation.mutate(persona.id);
  };

  const endCall = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'end_call' }));
      wsRef.current.close();
    }
    setIsInCall(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Implement actual muting logic here
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!script) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
          ← Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Script and Persona Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{script.title}</CardTitle>
                <CardDescription>Your Cold Call Script</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">{script.content}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select a Persona</CardTitle>
                <CardDescription>Choose who you want to practice with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {script.personas?.map((persona: any) => (
                  <Card
                    key={persona.id}
                    className={`cursor-pointer transition-all ${
                      selectedPersona?.id === persona.id ? 'ring-2 ring-primary' : ''
                    } ${isInCall ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => !isInCall && setSelectedPersona(persona)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{persona.name}</CardTitle>
                        <Badge className={getDifficultyColor(persona.difficulty)}>
                          {persona.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {selectedPersona && !isInCall && !callFeedback && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => startCall(selectedPersona)}
                disabled={startCallMutation.isPending}
              >
                <Phone className="mr-2" />
                {startCallMutation.isPending ? 'Connecting...' : 'Start Call'}
              </Button>
            )}
          </div>

          {/* Right: Call Interface or Feedback */}
          <div>
            {isInCall && (
              <Card>
                <CardHeader>
                  <CardTitle>Call in Progress</CardTitle>
                  <CardDescription>Speaking with {selectedPersona?.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transcript */}
                  <div className="h-96 overflow-y-auto space-y-2 bg-gray-50 p-4 rounded-lg">
                    {transcript.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded ${
                          entry.speaker === 'caller'
                            ? 'bg-blue-100 ml-4'
                            : 'bg-gray-200 mr-4'
                        }`}
                      >
                        <span className="font-semibold">
                          {entry.speaker === 'caller' ? 'You' : selectedPersona?.name}:
                        </span>{' '}
                        {entry.text}
                      </div>
                    ))}
                  </div>

                  {/* Call Controls */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={toggleMute}
                      className="flex-1"
                    >
                      {isMuted ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
                      {isMuted ? 'Unmute' : 'Mute'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={endCall}
                      className="flex-1"
                    >
                      <PhoneOff className="mr-2" />
                      End Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {callFeedback && (
              <Card>
                <CardHeader>
                  <CardTitle>Call Feedback</CardTitle>
                  <CardDescription>Your performance analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      {callFeedback.overall_score}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Script Adherence</span>
                        <span>{callFeedback.script_adherence}</span>
                      </div>
                      <Progress value={callFeedback.script_adherence} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Objection Handling</span>
                        <span>{callFeedback.objection_handling}</span>
                      </div>
                      <Progress value={callFeedback.objection_handling} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tonality</span>
                        <span>{callFeedback.tonality}</span>
                      </div>
                      <Progress value={callFeedback.tonality} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Value Delivery</span>
                        <span>{callFeedback.value_delivery}</span>
                      </div>
                      <Progress value={callFeedback.value_delivery} />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Detailed Feedback:</h4>
                    <p className="text-sm">{callFeedback.feedback}</p>
                  </div>

                  <Button className="w-full" onClick={() => navigate('/')}>
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

