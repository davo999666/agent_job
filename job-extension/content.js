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

        if (!response.body) {
            throw new Error("Response body is empty");
        }

        showAnalysisModal();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let fullOutput = "";

        function processSseEvent(eventBlock) {
            if (!eventBlock.trim()) {
                return;
            }

            const lines = eventBlock.split("\n");

            const eventLine = lines.find(line => line.startsWith("event:"));

            const dataLines = lines
                .filter(line => line.startsWith("data:"))
                .map(line => line.slice(5).replace(/^ /, ""));

            const eventName = eventLine ? eventLine.slice(6).trim() : "message";

            const eventData = dataLines.join("\n");

            if (!eventData) return;

            if (eventName === "token") {
                const token = JSON.parse(eventData);

                fullOutput += token;

                const outputElement = document.getElementById("ai-stream-output");

                if (outputElement) {
                    outputElement.textContent = fullOutput;
                }

            } else if (eventName === "done") {
                const result = JSON.parse(eventData);

                const timeElement = document.getElementById("ai-processing-time");

                if (timeElement) {
                    timeElement.textContent = `Processing time: ${result.processing_time_sec} sec`;
                }

            } else if (eventName === "error") {
                let errorMessage = eventData;

                try {
                    errorMessage = JSON.parse(eventData);
                } catch {
                    // Use the original error text.
                }

                throw new Error(errorMessage);
            }
        }

        while (true) {
            const { value, done } = await reader.read();

            buffer += decoder.decode(
                value || new Uint8Array(),
                { stream: !done }
            );

            // Normalize CRLF to LF.
            buffer = buffer.replace(/\r\n/g, "\n");

            const events = buffer.split("\n\n");

            // Save the incomplete event for the next reader.read().
            buffer = events.pop() || "";

            for (const eventBlock of events) {
                processSseEvent(eventBlock);
            }

            if (done) {
                // Process any remaining final event.
                if (buffer.trim()) {
                    processSseEvent(buffer);
                }

                break;
            }
        }

    } catch (error) {
        document.getElementById("ai-loading-toast")?.remove();

        const timeElement = document.getElementById("ai-processing-time");

        if (timeElement) {
            timeElement.textContent = `Error: ${error.message}`;
            timeElement.style.color = "#c62828";
        } else {
            document.getElementById("ai-modal")?.remove();

            alert("AI analysis failed: " + error.message);
        }
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