
showLoadingModal = function () {
    document.getElementById("ai-loading-toast")?.remove();

    document.body.insertAdjacentHTML("beforeend", `
        <div id="ai-loading-toast" style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 999999;
            background: #fff;
            padding: 18px 24px;
            border-left: 5px solid #0073b1;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,.2);
            font: 600 18px Arial, sans-serif;
        ">
            🤖 Analyzing Job...
        </div>
    `);
};



function showAnalysisModal() {
    document.getElementById("ai-loading-toast")?.remove();
    document.getElementById("ai-modal")?.remove();

    document.body.insertAdjacentHTML("beforeend", `
        <div id="ai-modal" style="
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: rgba(0, 0, 0, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        ">
            <div id="ai-modal-box" style="
                width: min(700px, 95vw);
                max-height: 85vh;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
                font-family: Arial, sans-serif;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <div id="ai-modal-header" style="
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-height: 62px;
                    padding-left: 28px;
                    border-bottom: 1px solid #e5e5e5;
                    background: #f3f3f3;
                ">
                    <h2 style="
                        margin: 0;
                        color: #0073b1;
                        font-size: 26px;
                    ">
                        🤖 AI Job Analysis
                    </h2>

                    <button id="ai-modal-close" type="button" style="
                        align-self: stretch;
                        width: 62px;
                        border: none;
                        background: transparent;
                        color: #222;
                        font-size: 32px;
                        font-weight: 300;
                        line-height: 1;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        ×
                    </button>
                </div>

                <div id="ai-modal-content" style="
                    padding: 28px;
                    overflow-y: auto;
                    min-height: 0;
                ">
                    <pre id="ai-stream-output" style="
                        margin: 0;
                        white-space: pre-wrap;
                        overflow-wrap: anywhere;
                        font-family: Arial, sans-serif;
                        font-size: 18px;
                        line-height: 1.6;
                        color: #222;
                    "></pre>

                    <div id="ai-processing-time" style="
                        margin-top: 22px;
                        padding-top: 15px;
                        border-top: 1px solid #ddd;
                        font-size: 15px;
                        color: #666;
                    ">
                        Generating analysis...
                    </div>
                </div>
            </div>
        </div>
    `);

    const modal = document.getElementById("ai-modal");
    const closeButton = document.getElementById("ai-modal-close");

    closeButton?.addEventListener("mouseenter", () => {
        closeButton.style.background = "#e81123";
        closeButton.style.color = "white";
    });

    closeButton?.addEventListener("mouseleave", () => {
        closeButton.style.background = "transparent";
        closeButton.style.color = "#222";
    });

    closeButton?.addEventListener("click", () => {
        modal?.remove();
    });

    modal?.addEventListener("click", event => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}