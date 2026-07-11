from http.client import HTTPException
import json
from time import perf_counter

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from LangChain.chain import cv_match_chain
from cv_extractor.extractor import CV_DATA

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
    start = perf_counter()

    try:
        analysis = cv_match_chain.invoke(
            {
                "job_title": job.title,
                "job_description": job.description,
                "cv_text": json.dumps(CV_DATA, ensure_ascii=False),
            }
        )

        return {
            "status": "success",
            "analysis": analysis,
            "processing_time_sec": round(perf_counter() - start, 2),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
    

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app)



#     python -m uvicorn main:app --reload