/**
 * Editorial Research Lab — Client Application
 * Connects directly to the local FastAPI research backend.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const form = document.getElementById("research-form");
  const questionInput = document.getElementById("question-input");
  const submitBtn = document.getElementById("submit-btn");
  const chipBtns = document.querySelectorAll(".chip-btn");

  const loadingSection = document.getElementById("loading-section");
  const stepSearch = document.getElementById("step-search");
  const stepAnalyze = document.getElementById("step-analyze");

  const errorSection = document.getElementById("error-section");
  const errorMessage = document.getElementById("error-message");
  const dismissErrorBtn = document.getElementById("dismiss-error-btn");

  const resultSection = document.getElementById("result-section");
  const resultQuestionTitle = document.getElementById("result-question-title");
  const answerBody = document.getElementById("answer-body");
  const sourcesGrid = document.getElementById("sources-grid");
  const sourcesBadge = document.getElementById("sources-badge");
  const sourceCountBadge = document.getElementById("source-count-badge");
  const copyBtn = document.getElementById("copy-btn");
  const copyBtnText = document.getElementById("copy-btn-text");
  const newSearchBtn = document.getElementById("new-search-btn");

  let stepTimer = null;
  let currentRawAnswer = "";

  // -------------------------------------------------------------
  // Suggested Query Chips
  // -------------------------------------------------------------
  chipBtns.forEach((chip) => {
    chip.addEventListener("click", () => {
      const query = chip.getAttribute("data-query");
      if (query) {
        questionInput.value = query;
        questionInput.focus();
        // Automatically resize if needed
        autoResizeTextarea(questionInput);
      }
    });
  });

  // -------------------------------------------------------------
  // Textarea auto-resize
  // -------------------------------------------------------------
  function autoResizeTextarea(element) {
    element.style.height = "auto";
    element.style.height = Math.min(element.scrollHeight, 250) + "px";
  }

  questionInput.addEventListener("input", () => {
    autoResizeTextarea(questionInput);
  });

  // Submit on Ctrl+Enter or Cmd+Enter
  questionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  // Dismiss Error
  if (dismissErrorBtn) {
    dismissErrorBtn.addEventListener("click", () => {
      errorSection.classList.add("hidden");
    });
  }

  // New Search Button
  if (newSearchBtn) {
    newSearchBtn.addEventListener("click", () => {
      questionInput.scrollIntoView({ behavior: "smooth", block: "center" });
      questionInput.focus();
    });
  }

  // Copy Brief Button
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      if (!currentRawAnswer) return;
      try {
        await navigator.clipboard.writeText(currentRawAnswer);
        copyBtnText.textContent = "Copied!";
        setTimeout(() => {
          copyBtnText.textContent = "Copy Brief";
        }, 2000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    });
  }

  // -------------------------------------------------------------
  // Form Submission & API Call
  // -------------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const question = questionInput.value.trim();
    if (!question) {
      questionInput.focus();
      return;
    }

    // Reset UI states
    hideError();
    resultSection.classList.add("hidden");
    setLoadingState(true);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        let errDetail = "The research answer could not be generated. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errDetail = errData.detail;
          }
        } catch (_) {}
        throw new Error(errDetail);
      }

      const data = await response.json();
      renderResults(data);
    } catch (err) {
      console.error("Research error:", err);
      showError(err.message || "An unexpected error occurred while conducting research. Please try again.");
    } finally {
      setLoadingState(false);
    }
  });

  // -------------------------------------------------------------
  // Loading State Management
  // -------------------------------------------------------------
  function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    questionInput.disabled = isLoading;

    if (isLoading) {
      loadingSection.classList.remove("hidden");
      stepSearch.classList.add("active");
      stepSearch.classList.remove("completed");
      stepAnalyze.classList.remove("active");

      // Realistic step transition: Tavily search usually takes 2-4s, then LLM generation
      if (stepTimer) clearTimeout(stepTimer);
      stepTimer = setTimeout(() => {
        stepSearch.classList.remove("active");
        stepSearch.classList.add("completed");
        stepAnalyze.classList.add("active");
      }, 3500);

      loadingSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      if (stepTimer) clearTimeout(stepTimer);
      loadingSection.classList.add("hidden");
    }
  }

  // -------------------------------------------------------------
  // Error Display
  // -------------------------------------------------------------
  function showError(msg) {
    errorMessage.textContent = msg;
    errorSection.classList.remove("hidden");
    errorSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideError() {
    errorSection.classList.add("hidden");
  }

  // -------------------------------------------------------------
  // Render Research Results
  // -------------------------------------------------------------
  function renderResults(data) {
    const { question, answer, raw_answer, sources } = data;
    currentRawAnswer = raw_answer || answer;

    // Set question headline
    resultQuestionTitle.textContent = question;

    // Update badges
    const sourceCount = sources ? sources.length : 0;
    sourceCountBadge.textContent = `${sourceCount} Web Sources`;
    sourcesBadge.textContent = `${sourceCount} ${sourceCount === 1 ? "Source" : "Sources"}`;

    // Render Answer Markdown
    answerBody.innerHTML = formatMarkdown(answer);

    // Render Sources Grid
    renderSources(sources);

    // Reveal result section with smooth scroll
    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // -------------------------------------------------------------
  // Render Sources Cards
  // -------------------------------------------------------------
  function renderSources(sources) {
    sourcesGrid.innerHTML = "";

    if (!sources || sources.length === 0) {
      const emptyNote = document.createElement("p");
      emptyNote.className = "sources-empty";
      emptyNote.textContent = "No external web sources were referenced.";
      sourcesGrid.appendChild(emptyNote);
      return;
    }

    sources.forEach((source) => {
      const card = document.createElement("div");
      card.className = "source-card";
      card.id = `source-${source.id}`;

      // Card Header
      const topBar = document.createElement("div");
      topBar.className = "source-card-top";

      const badge = document.createElement("span");
      badge.className = "source-badge";
      badge.textContent = `Source ${source.id}`;

      const domain = document.createElement("span");
      domain.className = "source-domain";
      domain.textContent = source.domain || extractHost(source.url);

      topBar.appendChild(badge);
      topBar.appendChild(domain);

      // Card Title
      const title = document.createElement("h4");
      title.className = "source-title";
      title.textContent = source.title || "Web Reference";

      card.appendChild(topBar);
      card.appendChild(title);

      // Optional Content Snippet
      if (source.content) {
        const snippet = document.createElement("p");
        snippet.className = "source-snippet";
        snippet.textContent = source.content;
        card.appendChild(snippet);
      }

      // Card Footer Link
      const footer = document.createElement("div");
      footer.className = "source-footer";

      const link = document.createElement("a");
      link.className = "source-link";
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = `Open source <span class="arrow" aria-hidden="true">→</span>`;

      footer.appendChild(link);
      card.appendChild(footer);

      sourcesGrid.appendChild(card);
    });
  }

  function extractHost(urlStr) {
    try {
      const u = new URL(urlStr);
      return u.hostname.replace(/^www\./, "");
    } catch (_) {
      return urlStr;
    }
  }

  // -------------------------------------------------------------
  // Editorial Markdown Formatter
  // Safely parses headings, paragraphs, lists, bold, italic,
  // and turns [Source X] citations into interactive jump badges.
  // -------------------------------------------------------------
  function formatMarkdown(text) {
    if (!text) return "";

    // Escape raw HTML first to prevent XSS
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace citations like [Source 1], [Source 2], *[Source 1]*
    escaped = escaped.replace(/(\*?\[Source\s*(\d+)\]\*?)/gi, (match, full, num) => {
      return `<a href="#source-${num}" class="citation-link" title="Jump to Source ${num}">Source ${num}</a>`;
    });

    const lines = escaped.split(/\r?\n/);
    const htmlParts = [];
    let inUl = false;
    let inOl = false;
    let paragraphBuffer = [];

    function flushParagraph() {
      if (paragraphBuffer.length > 0) {
        const pText = paragraphBuffer.join(" ").trim();
        if (pText) {
          htmlParts.push(`<p>${formatInline(pText)}</p>`);
        }
        paragraphBuffer = [];
      }
    }

    function closeLists() {
      if (inUl) {
        htmlParts.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        htmlParts.push("</ol>");
        inOl = false;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Empty line -> paragraph separator
      if (!line) {
        flushParagraph();
        closeLists();
        continue;
      }

      // Horizontal divider
      if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
        flushParagraph();
        closeLists();
        htmlParts.push("<hr>");
        continue;
      }

      // Headings: ###, ##, #
      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        closeLists();
        const level = Math.min(headingMatch[1].length + 1, 4); // map # -> h2, ## -> h3
        htmlParts.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
        continue;
      }

      // Bullet lists: - item or * item
      const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
      if (bulletMatch) {
        flushParagraph();
        if (inOl) {
          htmlParts.push("</ol>");
          inOl = false;
        }
        if (!inUl) {
          htmlParts.push("<ul>");
          inUl = true;
        }
        htmlParts.push(`<li>${formatInline(bulletMatch[1])}</li>`);
        continue;
      }

      // Numbered lists: 1. item
      const numMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        flushParagraph();
        if (inUl) {
          htmlParts.push("</ul>");
          inUl = false;
        }
        if (!inOl) {
          htmlParts.push("<ol>");
          inOl = true;
        }
        htmlParts.push(`<li>${formatInline(numMatch[2])}</li>`);
        continue;
      }

      // Regular text: collect into paragraph buffer
      paragraphBuffer.push(line);
    }

    flushParagraph();
    closeLists();

    return htmlParts.join("\n");
  }

  function formatInline(str) {
    return str
      // Bold + Italic: ***text***
      .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic: *text* or _text_
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Inline code: `code`
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }
});
