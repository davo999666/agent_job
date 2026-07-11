# CV-Job Matcher

An AI-powered application that analyzes job descriptions and compares them against a candidate's CV to provide detailed matching insights.

## Features

- **AI-Powered Matching**: Uses LLM (Qwen3.5) via LM Studio to analyze compatibility between jobs and CVs
- **Detailed Analysis**: Provides match percentages, missing skills, and scoring reasons
- **JSON Output**: Returns structured JSON data for easy integration
- **Browser Extension Support**: Includes a browser extension for seamless job application workflow

## How It Works

1. The system extracts information from the CV (skills, experience, projects, education)
2. Compares extracted CV data against the job description
3. Calculates match percentage and identifies missing skills
4. Returns structured analysis in JSON format

## API Endpoints

### GET `/`
Returns a welcome message confirming the server is running.

### POST `/job`
Accepts job information and returns matching analysis.

**Request Body:**
```json
{
  "url": "string",
  "title": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "analysis": {
    "match_percent": number,
    "matching_job_skills": ["skill1", "skill2"],
    "missing_skills": [
      {
        "skill": "string",
        "what_is_it": "string"
      }
    ],
    "score_reason": "string"
  },
  "processing_time_sec": number
}
```

## Installation

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

2. Activate the virtual environment:
   ```bash
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   
   # Linux/Mac
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

```bash
python main.py
# or
python -m uvicorn main:app --reload
```

The server will start on `http://localhost:8000` by default.

## Requirements

- Python 3.8+
- LM Studio running locally (for LLM inference)
- Qwen3.5 model configured in LM Studio at port 1234

## Dependencies

- **fastapi**: Web framework for the API server
- **pydantic**: Data validation and settings management
- **uvicorn**: ASGI server to run FastAPI applications
- **langchain-core**: Core LangChain functionality
- **langchain-openai**: Integration with OpenAI-compatible LLMs
- **pypdf**: PDF file parsing
- **python-docx**: Word document processing

## Browser Extension

The project includes a browser extension that integrates with the API:

- `job-extension/manifest.json`: Extension manifest configuration
- `job-extension/content.js`: Content script for page interaction
- `job-extension/modal/modal_window.js`: Modal window UI component

## Architecture

```
├── main.py              # FastAPI server entry point
├── requirements.txt     # Python dependencies
├── cv_extractor/        # CV extraction module
│   └── extractor.py    # CV parsing logic
├── LangChain/           # AI analysis components
│   ├── chain.py        # Chain orchestration
│   ├── llm.py          # LLM configuration
│   ├── prompt.py       # Prompt templates
│   └── prompt.py       # Prompt definitions
├── job-extension/      # Browser extension files
├── CV.pdf              # Sample CV for testing
└── cv_cache.json       # Cached CV data
```

## Configuration

The LLM is configured to use:
- Model: `qwen3.5-4b`
- Base URL: `http://127.0.0.1:1234/v1`
- API Key: `lm-studio`
- Temperature: 0.2 (for more deterministic responses)
- Max Tokens: 4000

## Usage Example

```bash
curl -X POST http://localhost:8000/job \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/job",
    "title": "Software Engineer",
    "description": "Looking for Python developer with AWS experience..."
  }'
```

## License

MIT License
