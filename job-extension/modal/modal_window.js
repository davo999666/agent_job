function showLoadingModal() {
    document.getElementById("ai-loading-toast")?.remove();

    document.body.insertAdjacentHTML("beforeend", `
        <div id="ai-loading-toast" style="
            position:fixed;
            bottom:20px;
            left:20px;
            z-index:999999;
            background:#fff;
            padding:18px 24px;
            border-left:5px solid #0073b1;
            border-radius:12px;
            box-shadow:0 8px 24px rgba(0,0,0,.2);
            font:600 18px Arial,sans-serif;">
            🤖 Analyzing Job...
        </div>
    `);
}

function showAnalysisModal(data, time = "") {
    try {
        const a = typeof data === "string" ? JSON.parse(data) : data;

        document.getElementById("ai-loading-toast")?.remove();
        document.getElementById("ai-modal")?.remove();

        document.body.insertAdjacentHTML("beforeend", `
            <div id="ai-modal" style="
                position:fixed;
                inset:0;
                background:rgba(0,0,0,.55);
                display:flex;
                justify-content:center;
                align-items:center;
                z-index:999999;">

                <div id="ai-modal-content" style="
                    width:720px;
                    max-width:95%;
                    max-height:90vh;
                    overflow:auto;
                    background:#fff;
                    border-radius:16px;
                    padding:28px;
                    font:16px/1.6 Arial,sans-serif;
                    box-shadow:0 20px 50px rgba(0,0,0,.35);">

                    <h1 style="margin:0 0 20px;font-size:30px;">
                        🎯 ${a.match_percent || 0}% Match
                        ${time ? `<span style="font-size:16px;color:#666;"> • ⏱ ${time} sec</span>` : ""}
                    </h1>

                    <h2 style="font-size:22px;">✅ Matching Skills</h2>
                    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px;">
                        ${(a.matching_job_skills || []).map(s => `
                            <span style="
                                background:#e8f3ff;
                                color:#005c99;
                                padding:8px 14px;
                                border-radius:20px;
                                font-size:15px;
                                font-weight:600;">
                                ${s}
                            </span>
                        `).join("")}
                    </div>

                    <h2 style="font-size:22px;">❌ Missing Skills</h2>
                    <ul style="font-size:16px;padding-left:20px;">
                        ${(a.missing_skills || []).map(i => `
                            <li style="margin-bottom:14px;">
                                <b style="font-size:17px;">${i.skill || i}</b><br>
                                <span style="color:#555;">${i.what_is_it || ""}</span>
                            </li>
                        `).join("")}
                    </ul>

                    <h2 style="font-size:22px;">🧠 Why this score</h2>
                    <p style="font-size:17px;">
                        ${a.score_reason || "No explanation."}
                    </p>

                    <button id="ai-close-btn" style="
                        margin-top:20px;
                        padding:12px 22px;
                        font-size:16px;
                        font-weight:bold;
                        border:0;
                        border-radius:8px;
                        background:#0073b1;
                        color:#fff;
                        cursor:pointer;">
                        Close
                    </button>
                </div>
            </div>
        `);

        // Close button
        document.getElementById("ai-close-btn")?.addEventListener("click", () => {
            document.getElementById("ai-modal")?.remove();
        });

        // Close by clicking outside the modal
        document.getElementById("ai-modal")?.addEventListener("click", e => {
            if (e.target.id === "ai-modal") {
                e.currentTarget.remove();
            }
        });

    } catch (e) {
        document.getElementById("ai-loading-toast")?.remove();
        console.error(e);
        alert("Invalid AI response");
    }
}