(() => {
  const page = document.body.dataset.page;

  if (page === "scan") {
    const form = document.getElementById("scanForm");
    const state = document.getElementById("scanState");
    const progress = document.getElementById("scanProgress");
    const message = document.getElementById("scanMessage");
    const stage = document.getElementById("scanStage");

    const steps = [
      {
        label: "Validating",
        stage: "Checking submitted details",
        progress: 20,
        message: "Inputs are being checked for format and completeness.",
      },
      {
        label: "Running",
        stage: "Scanning exposure and email posture",
        progress: 55,
        message:
          "The proxy would now send the business details to the workflow and gather findings.",
      },
      {
        label: "Translating",
        stage: "Writing plain-English explanations",
        progress: 80,
        message: "Findings are being turned into concise, non-technical guidance.",
      },
      {
        label: "Completed",
        stage: "Report ready",
        progress: 100,
        message: "The result is ready and the report can be sent by email.",
      },
    ];

    const setState = (label, stepStage, percent, copy) => {
      state.textContent = label;
      stage.textContent = stepStage;
      progress.style.width = `${percent}%`;
      message.textContent = copy;
    };

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const inputs = new FormData(form);
      const required = ["businessName", "websiteUrl", "emailDomain", "ownerEmail"];
      const missing = required.some((key) => !String(inputs.get(key) || "").trim());

      if (missing) {
        setState(
          "Failed",
          "Missing required fields",
          100,
          "Please fill in every field before starting a scan."
        );
        return;
      }

      setState("Validating", steps[0].stage, steps[0].progress, steps[0].message);

      let index = 0;
      const timer = window.setInterval(() => {
        index += 1;
        const step = steps[Math.min(index, steps.length - 1)];
        setState(step.label, step.stage, step.progress, step.message);

        if (index >= steps.length - 1) {
          window.clearInterval(timer);
        }
      }, 1200);
    });
  }

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationDelay = `${Math.min(
              Number(entry.target.dataset.delay || 0),
              400
            )}ms`;
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    revealEls.forEach((el, index) => {
      el.dataset.delay = String(index * 80);
      observer.observe(el);
    });
  }
})();
