let lastJobIdentifier = "";

async function sendSimple(title, description) {
    showLoadingModal();

    try {
        const response = await fetch("http://127.0.0.1:8000/job", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: window.location.href,
                title,
                description
            })
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        console.log("FastAPI response:", data);

        const analysis =
            data.analysis ??
            data.result ??
            data.output ??
            data.message ??
            data;

        const time =
            data.processing_time_sec ??
            data.processing_time ??
            data.execution_time ??
            data.time ??
            "";

        showAnalysisModal(analysis, time);
    } catch (error) {
        document.getElementById("ai-loading-toast")?.remove();
        console.error("AI error:", error);
        alert("AI analysis failed: " + error.message);
    }
}

function getLinkedInJobData() {
    const descriptionElement =
        document.querySelector(
            '[data-sdui-component="com.linkedin.sdui.generated.jobseeker.dsl.impl.aboutTheJob"] [data-testid="expandable-text-box"]'
        ) ||
        document.querySelector(
            '[componentkey^="JobDetails_AboutTheJob_"] [data-testid="expandable-text-box"]'
        ) ||
        document.querySelector(
            '[data-testid="expandable-text-box"]'
        );

    const titleElement =
        document.querySelector('[data-testid="job-title"]') ||
        document.querySelector('[componentkey*="JobDetails"] h1') ||
        document.querySelector('[componentkey*="JobDetails"] h2') ||
        document.querySelector(".jobs-unified-top-card__job-title") ||
        document.querySelector(
            ".job-details-jobs-unified-top-card__job-title"
        ) ||
        document.querySelector("main h1") ||
        document.querySelector("h1");

    const description =
        descriptionElement?.innerText.trim() || "";

    const title =
        titleElement?.innerText.trim() ||
        descriptionElement
            ?.querySelector("strong")
            ?.innerText.trim() ||
        description
            .split("\n")
            .find(line => line.trim()) ||
        "";

    return {
        title,
        description
    };
}

function getCurrentJobId() {
    const url = new URL(window.location.href);

    // Example: ?currentJobId=123456789
    const queryJobId = url.searchParams.get("currentJobId");

    if (queryJobId) {
        return queryJobId;
    }

    // Example: /jobs/view/123456789/
    const pathJobId = window.location.pathname.match(
        /\/jobs\/view\/(\d+)/
    )?.[1];

    if (pathJobId) {
        return pathJobId;
    }

    // Fallback: selected LinkedIn job card
    const selectedCard =
        document.querySelector(
            ".jobs-search-results__list-item--active"
        ) ||
        document.querySelector(
            '[aria-current="true"]'
        );

    return (
        selectedCard?.getAttribute("data-job-id") ||
        selectedCard?.getAttribute("data-occludable-job-id") ||
        selectedCard
            ?.querySelector("[data-job-id]")
            ?.getAttribute("data-job-id") ||
        ""
    );
}

function checkJobChange() {
    if (!location.hostname.includes("linkedin.com")) {
        return;
    }

    const jobId = getCurrentJobId();

    // Do nothing when there is no job ID
    // or the same job is still open
    if (!jobId || jobId === lastJobIdentifier) {
        return;
    }

    const { title, description } = getLinkedInJobData();

    // Wait until the new job content is loaded
    if (!title || !description || description.length < 50) {
        return;
    }

    // Save only the stable job ID
    lastJobIdentifier = jobId;

    sendSimple(title, description);
}

checkJobChange();

setInterval(checkJobChange, 1500);