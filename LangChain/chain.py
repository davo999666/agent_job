from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.runnables import RunnableLambda

from .llm import get_llm
from .prompt import MATCH_PROMPT

def print_tokens(chain_name):
    def _print(message):
        usage = getattr(message, "usage_metadata", None)

        if usage:
            print(
                f"[{chain_name}] "
                f"Input: {usage.get('input_tokens', 0)} | "
                f"Output: {usage.get('output_tokens', 0)} | "
                f"Total: {usage.get('total_tokens', 0)}",
                flush=True,
            )

        return message

    return _print


llm = get_llm()
parser = JsonOutputParser()

cv_match_chain = MATCH_PROMPT | llm | StrOutputParser()




