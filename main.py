import json
from time import perf_counter

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from LangChain.chain import cv_match_chain
from cv_extractor.extractor import cache_is_valid, convert_cv_to_json, find_cv, load_cached_cv, save_cv_cache

app = FastAPI()

# Allow requests from your browser extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Job(BaseModel):
    url: str
    title: str
    description: str


@app.get("/")
def root():
    return {"message": "Server is running"}


@app.post("/job")
def receive_job(job: Job):
    def generate():
        job_data = { "title": job.title,"description": job.description }
        start = perf_counter()

        try:
            # -----------------------------
            # Find CV
            # -----------------------------
            cv_file = find_cv()

            # -----------------------------
            # Use cached CV if available
            # -----------------------------
            cv_data = None
            cached_data = None

            if cache_is_valid(cv_file):
                cached_data = load_cached_cv()

                if cached_data is not None:
                    cv_data = cached_data
                    yield (
                        "event: cv_cached\n"
                        f"data: {json.dumps({'status': 'Using cached CV'}, ensure_ascii=False)}\n\n"
                    )

            # If no cached data, convert the CV
            if cv_data is None:
                yield (
                    "event: status\n"
                    f"data: {json.dumps('Converting CV...', ensure_ascii=False)}\n\n"
                )

                cv_data = convert_cv_to_json(cv_file)

                # -----------------------------
                # Cache CV data
                # -----------------------------
                try:
                    save_cv_cache(cv_data)
                except OSError as cache_err:
                    print(f"Warning: Could not save CV cache: {cache_err}", flush=True)
                except Exception as cache_err:
                    print(f"Warning: CV cache error: {cache_err}", flush=True)

            # -----------------------------
            # Stream LLM response
            # -----------------------------
            yield (
                "event: status\n"
                f"data: {json.dumps('Analyzing CV...', ensure_ascii=False)}\n\n"
            )

            result = None

            for chunk in cv_match_chain.stream({"job_text": job_data,"cv_text": cv_data}):
                # Save the latest/final result
                result = chunk
                # Handle string output
                if isinstance(chunk, str):
                    token = chunk

                    if token:
                        yield (
                            "event: token\n"
                            f"data: {json.dumps(token, ensure_ascii=False)}\n\n"
                        )

                # Handle LangChain AIMessage
                elif hasattr(chunk, "content"):
                    if chunk.content:
                        yield (
                            "event: token\n"
                            f"data: {json.dumps(chunk.content, ensure_ascii=False)}\n\n"
                        )

                # Handle dictionary output
                elif isinstance(chunk, dict):
                    # If your chain returns something like:
                    # {"analysis": "..."}
                    if "analysis" in chunk:
                        analysis = chunk["analysis"]

                        if isinstance(analysis, str):
                            yield (
                                "event: token\n"
                                f"data: {json.dumps(analysis, ensure_ascii=False)}\n\n"
                            )
            # Print usage ONLY ONCE

            if result is None:
                raise RuntimeError(
                    "The CV match chain did not return a result."
                )

            # -----------------------------
            # Done
            # -----------------------------
            done_data = {"processing_time_sec": round( perf_counter() - start, 2, )}

            yield (
                "event: done\n"
                f"data: {json.dumps(done_data, ensure_ascii=False)}\n\n"
            )

        except Exception as error:
            print(
                f"\nStreaming error: {error}",
                flush=True,
            )

            yield (
                "event: error\n"
                f"data: {json.dumps(str(error), ensure_ascii=False)}\n\n"
            )

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app)



#     python -m uvicorn main:app --reload