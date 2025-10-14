import json
from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_personas(script_content: str) -> list:
    """Generate 3 personas (easy, medium, hard) based on the script using GPT-5 Thinking."""
    
    prompt = f"""Analyze this cold call pitch script and create 3 different personas that a salesperson might encounter when using this script. Each persona should have a different difficulty level.

Script:
{script_content}

Create exactly 3 personas with the following structure for each:
1. EASY persona: Pleasant, agreeable, interested, minimal objections, easy to convince
2. MEDIUM persona: Neutral, some skepticism, moderate objections, needs convincing
3. HARD persona: Difficult, rude, strong objections, very skeptical (but still possible to win over)

For each persona, provide:
- A realistic name
- Personality traits (as a JSON string)
- Common objections they would raise (as a JSON string)

Return the response as a JSON array with exactly 3 personas in this format:
[
  {{
    "difficulty": "easy",
    "name": "Full Name",
    "personality": "{{\\"traits\\": [\\"trait1\\", \\"trait2\\"], \\"behavior\\": \\"description\\"}}",
    "objections": "{{\\"common\\": [\\"objection1\\", \\"objection2\\"]}}"
  }},
  ...
]"""

    response = client.chat.completions.create(
        model="gpt-4o",  # Using GPT-4o as a fallback - update to gpt-5-thinking when available
        messages=[
            {"role": "system", "content": "You are an expert in sales psychology and persona creation. Always return valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.8,
        response_format={"type": "json_object"}
    )
    
    result = json.loads(response.choices[0].message.content)
    
    # Handle both array and object responses
    if isinstance(result, dict) and "personas" in result:
        personas = result["personas"]
    elif isinstance(result, list):
        personas = result
    else:
        # Fallback: extract personas from the result
        personas = [result.get("easy"), result.get("medium"), result.get("hard")]
    
    return personas

async def analyze_call(transcript: str, script_content: str, persona_name: str) -> dict:
    """Analyze a call transcript and provide detailed feedback using GPT-5 Thinking."""
    
    prompt = f"""Analyze this cold call practice session and provide detailed constructive feedback.

ORIGINAL SCRIPT:
{script_content}

PERSONA BEING PITCHED TO: {persona_name}

CALL TRANSCRIPT:
{transcript}

Analyze the following aspects and provide a score (0-100) and feedback for each:
1. Script Adherence: How well did the caller follow the script?
2. Objection Handling: How effectively did they handle objections?
3. Tonality & Pacing: Was their tone and pacing appropriate?
4. Value Delivery: Did they communicate the value proposition clearly?
5. Overall Outcome: Was the call successful?

Provide your analysis in the following JSON format:
{{
  "overall_score": <0-100>,
  "script_adherence": <0-100>,
  "objection_handling": <0-100>,
  "tonality": <0-100>,
  "value_delivery": <0-100>,
  "outcome": "success|partial|failure",
  "feedback": "Detailed constructive feedback with specific examples and actionable suggestions for improvement"
}}"""

    response = client.chat.completions.create(
        model="gpt-4o",  # Using GPT-4o as a fallback - update to gpt-5-thinking when available
        messages=[
            {"role": "system", "content": "You are an expert sales coach providing constructive feedback. Always return valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    
    analysis = json.loads(response.choices[0].message.content)
    return analysis

def create_persona_system_prompt(persona_data: dict) -> str:
    """Create a system prompt for the Realtime API to act as a specific persona."""
    
    personality = json.loads(persona_data["personality"]) if isinstance(persona_data["personality"], str) else persona_data["personality"]
    objections = json.loads(persona_data["objections"]) if isinstance(persona_data["objections"], str) else persona_data["objections"]
    
    prompt = f"""You are {persona_data['name']}, a potential customer receiving a cold call.

PERSONALITY & BEHAVIOR:
{json.dumps(personality, indent=2)}

DIFFICULTY LEVEL: {persona_data['difficulty'].upper()}

YOUR OBJECTIONS:
{json.dumps(objections, indent=2)}

INSTRUCTIONS:
- Act naturally as this persona would during a real cold call
- Use the personality traits to guide your responses
- Raise the objections naturally during the conversation (don't list them all at once)
- {"Be pleasant and relatively easy to convince" if persona_data['difficulty'] == 'easy' else "Be moderately skeptical but open to persuasion" if persona_data['difficulty'] == 'medium' else "Be very skeptical, rude, and difficult to convince (but not impossible)"}
- Keep responses brief and realistic (like a real phone conversation)
- Don't reveal you're an AI - stay in character as {persona_data['name']}
- End the call naturally when appropriate (hang up if very dissatisfied, or agree to next steps if convinced)

Start the conversation by answering the phone. Begin with a simple "Hello?" or similar greeting."""
    
    return prompt

