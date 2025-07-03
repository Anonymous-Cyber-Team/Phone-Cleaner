document.addEventListener("DOMContentLoaded", () => {
  // --- এলিমেন্ট নির্বাচন ---
  const views = {
    initial: document.getElementById("initial-view"),
    cleaning: document.getElementById("cleaning-view"),
    result: document.getElementById("result-view"),
    alreadyClean: document.getElementById("already-clean-view"),
  };
  const statusSpans = {
    overall: document.getElementById("overall-status"),
    junk: document.getElementById("junk-status"),
    ram: document.getElementById("ram-status"),
    battery: document.getElementById("battery-status"),
    cpu: document.getElementById("cpu-status"),
  };
  const animationIcons = {
    junk: document.getElementById("junk-animation"),
    ram: document.getElementById("ram-animation"),
    battery: document.getElementById("battery-animation"),
    cpu: document.getElementById("cpu-animation"),
  };
  const cleanButtons = document.querySelectorAll(".main-button");
  const backButtons = document.querySelectorAll(".back-button");
  const themeToggleButton = document.getElementById("theme-toggle-button");
  const body = document.body;
  const progressBar = document.getElementById("progress-bar");
  const scanLog = document.getElementById("scan-log");
  const cleaningStatusText = document.getElementById("cleaning-status");
  const resultTitle = document.getElementById("result-title");
  const resultStats = document.getElementById("result-stats");
  const junkReportDetails = document.getElementById("junk-report-details");
  const alreadyCleanTitle = document.getElementById("already-clean-title");
  const alreadyCleanMessage = document.getElementById("already-clean-message");
  const scanSound = document.getElementById("scan-sound");
  const completeSound = document.getElementById("complete-sound");

  const TEN_MINUTES = 10 * 60 * 1000;
  let problemValues = {};

  // --- Helper Functions ---
  const showView = (viewToShow) => {
    Object.values(views).forEach((view) => view.classList.add("hidden"));
    viewToShow.classList.remove("hidden");
  };
  const getRandomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} MB`;
    return `${(bytes / 1024).toFixed(1)} GB`;
  };

  // --- থিম ম্যানেজমেন্ট ---
  const applyTheme = (theme) => {
    if (theme === "light") {
      body.classList.add("light-theme");
      themeToggleButton.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      body.classList.remove("light-theme");
      themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    }
  };
  const toggleTheme = () => {
    const currentTheme = localStorage.getItem("theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };
  themeToggleButton.addEventListener("click", toggleTheme);
  applyTheme(localStorage.getItem("theme") || "dark"); // পেজ লোডে থিম প্রয়োগ

  // --- Main Logic ---
  async function updateMainScreenStatus() {
    ["junk", "ram", "battery", "cpu"].forEach((type) => {
      const lastCleaned = localStorage.getItem(`lastCleanedTime_${type}`);
      if (lastCleaned && Date.now() - lastCleaned > TEN_MINUTES) {
        localStorage.removeItem(`lastCleanedTime_${type}`);
        localStorage.removeItem(`problem_${type}`);
      }
    });

    let problemCount = 0;

    // 1. জাঙ্ক ফাইল স্ট্যাটাস
    if (localStorage.getItem("lastCleanedTime_junk")) {
      statusSpans.junk.textContent = "Clean";
      statusSpans.junk.className = "status-value status-clean";
    } else {
      problemCount++;
      let junkSize =
        localStorage.getItem("problem_junk") || getRandomNumber(300, 1200);
      localStorage.setItem("problem_junk", junkSize);
      problemValues.junk = parseInt(junkSize);
      statusSpans.junk.textContent = `${formatBytes(problemValues.junk)} Found`;
      statusSpans.junk.className =
        problemValues.junk > 700
          ? "status-value status-critical"
          : "status-value status-attention";
    }

    // 2. RAM স্ট্যাটাস
    if (localStorage.getItem("lastCleanedTime_ram")) {
      statusSpans.ram.textContent = "Optimized";
      statusSpans.ram.className = "status-value status-clean";
    } else {
      problemCount++;
      let ramUsage =
        localStorage.getItem("problem_ram") || getRandomNumber(80, 95);
      localStorage.setItem("problem_ram", ramUsage);
      problemValues.ram = parseInt(ramUsage);
      statusSpans.ram.textContent = `High (${problemValues.ram}%)`;
      statusSpans.ram.className = "status-value status-critical";
    }

    // 3. ব্যাটারি স্ট্যাটাস
    if (localStorage.getItem("lastCleanedTime_battery")) {
      statusSpans.battery.textContent = "Optimized";
      statusSpans.battery.className = "status-value status-clean";
    } else {
      problemCount++;
      let batteryDrain =
        localStorage.getItem("problem_battery") || getRandomNumber(3, 8);
      localStorage.setItem("problem_battery", batteryDrain);
      problemValues.battery = parseInt(batteryDrain);
      statusSpans.battery.textContent = `${problemValues.battery} Apps Detected`;
      statusSpans.battery.className = "status-value status-attention";
    }

    // 4. CPU স্ট্যাটাস (নতুন)
    if (localStorage.getItem("lastCleanedTime_cpu")) {
      statusSpans.cpu.textContent = "Cool";
      statusSpans.cpu.className = "status-value status-clean";
    } else {
      problemCount++;
      let cpuTemp =
        localStorage.getItem("problem_cpu") || getRandomNumber(45, 60);
      localStorage.setItem("problem_cpu", cpuTemp);
      problemValues.cpu = parseInt(cpuTemp);
      statusSpans.cpu.textContent = `Hot (${problemValues.cpu}°C)`;
      statusSpans.cpu.className =
        problemValues.cpu > 55
          ? "status-value status-severe"
          : "status-value status-critical";
    }

    updateOverallStatus(problemCount);
    updateDynamicBackground(problemCount);
    showView(views.initial);
  }

  function updateOverallStatus(problemCount) {
    let statusText, statusClass;
    if (problemCount >= 3) {
      statusText = "Critical!";
      statusClass = document.querySelector(".status-severe")
        ? "status-severe"
        : "status-critical";
    } else if (problemCount === 2) {
      statusText = "Attention Needed";
      statusClass = "status-attention";
    } else if (problemCount === 1) {
      statusText = "Good";
      statusClass = "status-good";
    } else {
      statusText = "Optimized";
      statusClass = "status-clean";
    }
    statusSpans.overall.textContent = statusText;
    statusSpans.overall.className = statusClass;
  }

  function updateDynamicBackground(problemCount) {
    body.classList.remove(
      "status-bg-severe",
      "status-bg-critical",
      "status-bg-attention",
      "status-bg-good",
      "status-bg-clean"
    );
    if (problemCount >= 3)
      body.classList.add(
        document.querySelector(".status-severe")
          ? "status-bg-severe"
          : "status-bg-critical"
      );
    else if (problemCount === 2) body.classList.add("status-bg-attention");
    else if (problemCount === 1) body.classList.add("status-bg-good");
    else body.classList.add("status-bg-clean");
  }

  // --- Cleaning Logic ---
  function startCleaning(type) {
    if (localStorage.getItem(`lastCleanedTime_${type}`)) {
      showAlreadyCleanScreen(type);
      return;
    }

    // সঠিক অ্যানিমেশন এবং টেক্সট সেট করা
    Object.values(animationIcons).forEach((icon) =>
      icon.classList.add("hidden")
    );
    animationIcons[type].classList.remove("hidden");

    const cleaningTexts = {
      junk: "Cleaning Junk Files...",
      ram: "Boosting RAM Performance...",
      battery: "Optimizing Battery Usage...",
      cpu: "Cooling Down CPU...",
    };
    cleaningStatusText.textContent = cleaningTexts[type];

    showView(views.cleaning);
    scanSound.play().catch((e) => {});
    let progress = 0;
    scanLog.textContent = "[INFO] Initializing scan engine...\n";
    const animationDuration = 8000;
    const intervalTime = 100;
    const totalSteps = animationDuration / intervalTime;
    const progressIncrement = 100 / totalSteps;

    const scanInterval = setInterval(() => {
      progress += progressIncrement;
      progressBar.style.width = `${Math.min(100, progress)}%`;
      const logActions = ["Scanning", "Checking", "Verifying", "Cleaning"];
      const action = logActions[getRandomNumber(0, logActions.length - 1)];
      scanLog.textContent += `[${action.slice(0, 4).toUpperCase()}] /.../${(
        Math.random() + 1
      )
        .toString(36)
        .substring(2)}.tmp ... OK\n`;
      scanLog.scrollTop = scanLog.scrollHeight;
      if (progress >= 100) {
        clearInterval(scanInterval);
        scanLog.textContent += "[INFO] Finalizing process...";
        setTimeout(() => finishCleaning(type), 500);
      }
    }, intervalTime);
  }

  function finishCleaning(type) {
    scanSound.pause();
    scanSound.currentTime = 0;
    completeSound.play().catch((e) => {});

    let title, stats;
    // ফলাফল দেখানোর আগে ডিফল্ট ভিউ সেট করুন
    resultStats.classList.remove("hidden");
    junkReportDetails.classList.add("hidden");
    junkReportDetails.innerHTML = "";

    if (type === "junk") {
      title = "Junk Files Cleaned!";
      const totalJunk = problemValues.junk;
      // জাঙ্কের বিস্তারিত রিপোর্ট তৈরি
      const cache = Math.round(totalJunk * (getRandomNumber(40, 60) / 100));
      const temp = Math.round(
        (totalJunk - cache) * (getRandomNumber(50, 70) / 100)
      );
      const obsolete = totalJunk - cache - temp;

      stats = `Successfully cleaned ${formatBytes(totalJunk)} of space.`;
      resultStats.textContent = stats;

      junkReportDetails.innerHTML = `
            <ul>
                <li><span>System Cache:</span> <span>${formatBytes(
                  cache
                )}</span></li>
                <li><span>Temp Files:</span> <span>${formatBytes(
                  temp
                )}</span></li>
                <li><span>Obsolete APKs:</span> <span>${formatBytes(
                  obsolete
                )}</span></li>
            </ul>
        `;
      junkReportDetails.classList.remove("hidden");
    } else if (type === "ram") {
      title = "RAM Boosted!";
      stats = `RAM usage optimized from ${
        problemValues.ram
      }% to ${getRandomNumber(30, 45)}%.`;
      resultStats.textContent = stats;
    } else if (type === "battery") {
      title = "Battery Optimized!";
      stats = `${problemValues.battery} apps put to sleep for better battery life.`;
      resultStats.textContent = stats;
    } else if (type === "cpu") {
      title = "CPU Cooled Down!";
      stats = `Temperature reduced from ${
        problemValues.cpu
      }°C to ${getRandomNumber(32, 38)}°C.`;
      resultStats.textContent = stats;
    }

    resultTitle.textContent = title;
    localStorage.setItem(`lastCleanedTime_${type}`, Date.now());
    localStorage.removeItem(`problem_${type}`);
    showView(views.result);
  }

  function showAlreadyCleanScreen(type) {
    const messages = {
      junk: {
        title: "Junk Files Clean",
        message: "Your system junk files are already cleared.",
      },
      ram: {
        title: "RAM Optimized",
        message: "Your device RAM is already running smoothly.",
      },
      battery: {
        title: "Battery Safe",
        message: "Battery settings are already optimized.",
      },
      cpu: {
        title: "CPU is Cool",
        message: "Your CPU temperature is already normal.",
      },
    };
    alreadyCleanTitle.textContent = messages[type].title;
    alreadyCleanMessage.textContent = messages[type].message;
    showView(views.alreadyClean);
  }

  // --- Event Listeners ---
  cleanButtons.forEach((button) => {
    button.addEventListener("click", () => startCleaning(button.dataset.type));
  });
  backButtons.forEach((button) => {
    button.addEventListener("click", updateMainScreenStatus);
  });

  // Initial load
  updateMainScreenStatus();
});
