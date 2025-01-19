import os
from pathlib import Path
import json
from gpt4all import GPT4All

# Path to your GPT4All Mistral model
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = os.path.join(BASE_DIR, "models")

# A system prompt that instructs GPT on how to respond in structured JSON
SYSTEM_PROMPT = """
You are a helpful finance assistant. You will receive questions about a user's spendings.
You must ALWAYS respond in valid JSON with these fields:

{
  "action": "<sum_spending or list_spending>",
  "category": "<a string or list of strings, or 'all'>",
  "name": "<a string or null if not provided>",
  "start_date": "<YYYY-MM-DD or null>",
  "end_date": "<YYYY-MM-DD or null>"
}

- "category" can be "all", a single category like "Food", or an array like ["housing", "food"] if the user asks for multiple categories.
- "name" is a substring for searching the 'name' field in the spending. If the user references 'rent' or 'groceries' as a spending name, fill that in. Otherwise null.

You can interpret partial times. For instance:
- "this month" => from the first day of the current month to the last day of the current month
- "in january 2025" => from 2025-01-01 to 2025-01-31

The current month is january 2025

If you cannot parse the date, set start_date and end_date to null.
If the user does not specify category, set it to "all".

If you cannot parse the question, return:
{
  "error": "Unable to interpret query."
}
"""

class GPTQueryHandler:
    def __init__(self, model_path=MODEL_PATH):
        self.gpt = GPT4All(model_name="mistral-7b-instruct-v0.1.Q4_0.gguf", model_path=model_path, allow_download=False)

    def parse_query(self, user_prompt: str) -> dict:
        """Generate a structured JSON response from the GPT model."""
        # Combine system prompt + user's query
        full_prompt = SYSTEM_PROMPT + "\nUser: " + user_prompt + "\nAssistant: "

        # Instruct GPT4All to produce up to 200 tokens
        output = self.gpt.generate(
            prompt=full_prompt,
            max_tokens=200
        )
        # output is plain text— try to parse as JSON
        try:
            data = json.loads(output)
        except json.JSONDecodeError:
            data = {"error": "Model did not return valid JSON."}
        return data