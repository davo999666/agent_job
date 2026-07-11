from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnableLambda

from .llm import get_llm
from .prompt import CV_EXTRACT_PROMPT, MATCH_PROMPT

def print_tokens(message):
    usage = message.usage_metadata or {}
    print(
        f"Input: {usage.get('input_tokens', 0)} | "
        f"Output: {usage.get('output_tokens', 0)} | "
        f"Total: {usage.get('total_tokens', 0)}"
    )
    return message


llm = get_llm()
parser = JsonOutputParser()

cv_match_chain = MATCH_PROMPT | llm | RunnableLambda(print_tokens) | parser
cv_extract_chain = CV_EXTRACT_PROMPT | llm | parser



