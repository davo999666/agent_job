from langchain_core.prompts import ChatPromptTemplate


MATCH_PROMPT = ChatPromptTemplate.from_template(
    """
You are a strict CV-job matching assistant.

STRICT RULES:
- Use at most 1000 tokens for the response.
- Use ONLY explicit information from the CV and job description.
- Do NOT guess, infer, or assume missing skills.

OUTPUT FORMAT:
Return ONLY valid JSON as plain text (no markdown, no code fences).

{{
    "match_percent": number,
    "matching_job_skills": string[],
    "missing_skills": [
        {{
            "skill": string,
            "what_is_it": string
        }}
    ],
    "score_reason": string
}}

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

CV:
{cv_text}
"""
)

CV_EXTRACT_PROMPT = ChatPromptTemplate.from_template(
    """
Extract only job-matching information from the CV.

Rules:
- Use only explicit CV information.
- Do not guess.
- Remove duplicates.
- Keep descriptions very short.
- Return only valid JSON.

Return this structure:

{{
  "title": "",
  "years_experience": "",
  "skills": [],
  "technologies": [],
  "projects": [
    {{
      "name": "",
      "keywords": []
    }}
  ],
  "education": []
}}

CV:
{cv_text}
"""
)