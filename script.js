const defaultSections = [
  {
    title: "DRUMMER",
    names: [
      "ALVARADO JAZTICE",
      "BARIMBAD JOSEPH KEVIN",
      "IGOT RHYNE JAM",
      "NUDALO ARVIN JAMES",
      "YGUINTO VONN"
    ]
  },
  {
    title: "SNARER",
    names: [
      "BURGOS LEANDRIE",
      "CORDERO BENMAR TROY",
      "ISABELO CJ",
      "LUNA ANTHONY",
      "MANSUETO VAN",
      "ORDENIZA ROMEL",
      "REDELOSA JEBSON",
      "REDELOSA JOHN RAYVER",
      "PARTOSA KEVIN"
    ]
  },
  {
    title: "BASSDRUMMER",
    names: ["ALBARICO CHOY", "BERNALDRE LALA"]
  },
  {
    title: "LYRIST",
    names: ["JOSEPH KARL BARIMBAD", "FIJIE SARTAGODA"]
  },
  {
    title: "BUGLER",
    names: ["BUGLER"]
  }
];

const STORAGE_KEY = "unlisted-dbc-attendance";
const tableHead = document.querySelector("#tableHead");
const tableBody = document.querySelector("#tableBody");
const addDateBtn = document.querySelector("#addDateBtn");
const addNameBtn = document.querySelector("#addNameBtn");
const removeNameBtn = document.querySelector("#removeNameBtn");
const exportCsvBtn = document.querySelector("#exportCsvBtn");
const exportPhotoBtn = document.querySelector("#exportPhotoBtn");
const clearDataBtn = document.querySelector("#clearDataBtn");

let attendanceData = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { 
      dates: [getFormattedDate(new Date())],
      records: {},
      sections: JSON.parse(JSON.stringify(defaultSections))
    };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      dates: parsed.dates || [getFormattedDate(new Date())],
      records: parsed.records || {},
      sections: parsed.sections || JSON.parse(JSON.stringify(defaultSections))
    };
  } catch (error) {
    console.warn("Could not parse saved attendance state", error);
    return {
      dates: [getFormattedDate(new Date())],
      records: {},
      sections: JSON.parse(JSON.stringify(defaultSections))
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceData));
}

function getFormattedDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildTable() {
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `<th>Name</th>${attendanceData.dates
    .map((date) => `<th>${date}</th>`) 
    .join("")}`;
  tableHead.appendChild(headerRow);

  attendanceData.sections.forEach((section) => {
    const sectionRow = document.createElement("tr");
    sectionRow.className = "section-row";
    sectionRow.innerHTML = `<td colspan="${attendanceData.dates.length + 1}">${section.title}</td>`;
    tableBody.appendChild(sectionRow);

    section.names.forEach((name) => {
      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      nameCell.className = "name-cell";
      nameCell.textContent = name;
      row.appendChild(nameCell);

      attendanceData.dates.forEach((date) => {
        const cell = document.createElement("td");
        const button = document.createElement("button");
        button.className = "cell-button";
        button.type = "button";

        const recordKey = `${name}|${date}`;
        let state = attendanceData.records[recordKey];
        updateButtonState(button, state);

        button.addEventListener("click", () => {
          const nextState = getNextState(state);
          attendanceData.records[recordKey] = nextState;
          updateButtonState(button, nextState);
          state = nextState;
          saveState();
        });

        cell.appendChild(button);
        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    });
  });
}

function updateButtonState(button, state) {
  button.textContent = "";
  button.className = "cell-button";

  if (state === "present") {
    button.classList.add("present");
    button.textContent = "✓";
  } else if (state === "absent") {
    button.classList.add("absent");
    button.textContent = "✕";
  } else {
    button.textContent = "–";
  }
}

function getNextState(current) {
  if (current === undefined || current === null) return "present";
  if (current === "present") return "absent";
  return null;
}

function addDate() {
  const newDate = prompt("Enter a date (YYYY-MM-DD)", getFormattedDate(new Date()));
  if (!newDate) return;

  const normalized = newDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    alert("Date format must be YYYY-MM-DD.");
    return;
  }

  if (attendanceData.dates.includes(normalized)) {
    alert("This date already exists.");
    return;
  }

  attendanceData.dates.push(normalized);
  saveState();
  buildTable();
}

function exportCsv() {
  const headers = ["Name", ...attendanceData.dates];
  const rows = [];

  attendanceData.sections.forEach((section) => {
    rows.push([section.title]);
    section.names.forEach((name) => {
      const row = [name];
      attendanceData.dates.forEach((date) => {
        const state = attendanceData.records[`${name}|${date}`];
        row.push(state === "present" ? "P" : state === "absent" ? "A" : "");
      });
      rows.push(row);
    });
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "unlisted_dbc_attendance.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function exportPhoto() {
  const source = document.querySelector(".table-wrap");
  const clone = source.cloneNode(true);

  clone.querySelectorAll("thead th").forEach((el) => {
    el.style.position = "static";
  });
  clone.querySelectorAll("td.name-cell").forEach((el) => {
    el.style.position = "static";
    el.style.left = "auto";
  });

  const wrapper = document.createElement("div");
  wrapper.style.display = "inline-block";
  wrapper.style.background = "#ffffff";
  wrapper.style.padding = "20px";
  wrapper.style.fontFamily = getComputedStyle(document.documentElement).fontFamily || "sans-serif";
  wrapper.appendChild(clone);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.appendChild(wrapper);
  document.body.appendChild(container);

  const width = wrapper.scrollWidth;
  const height = wrapper.scrollHeight;
  const css = `
    <style>
      body { margin: 0; font-family: ${wrapper.style.fontFamily}; }
      table { width: 100%; border-collapse: collapse; min-width: 760px; }
      thead th, tbody td { border: 1px solid #ccc; padding: 10px 8px; text-align: center; vertical-align: middle; }
      thead th { background: #f2f2f2; position: static; }
      td.name-cell { text-align: left; font-weight: 600; background: #fafafa; position: static; left: auto; }
      .section-row td { background: #ddd; text-align: left; font-weight: 700; padding-left: 14px; }
      .cell-button { width: 30px; height: 30px; border-radius: 4px; border: 1px solid #bbb; background: #fff; }
      .cell-button.present { background: #4caf50; color: white; }
      .cell-button.absent { background: #ef5350; color: white; }
    </style>
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${css}
          ${wrapper.innerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);
    document.body.removeChild(container);

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "unlisted_dbc_attendance.png";
    link.click();
  };
  img.onerror = () => {
    document.body.removeChild(container);
    alert("Could not export photo. Please try in a modern browser.");
  };
  img.src = url;
}

function addName() {
  const sectionTitle = prompt(
    "Enter a section name (for example DRUMMER, SNARER, BASSDRUMMER):"
  );
  if (!sectionTitle) return;

  const normalizedTitle = sectionTitle.trim().toUpperCase();
  if (!normalizedTitle) {
    alert("Section name cannot be empty.");
    return;
  }

  let section = attendanceData.sections.find(
    (s) => s.title.toUpperCase() === normalizedTitle
  );

  if (!section) {
    const createNew = confirm(
      `Section "${normalizedTitle}" does not exist. Create it?`
    );
    if (!createNew) return;
    section = { title: normalizedTitle, names: [] };
    attendanceData.sections.push(section);
  }

  const name = prompt(`Enter the name to add to ${section.title}:`);
  if (!name) return;

  const trimmedName = name.trim().toUpperCase();
  if (!trimmedName) {
    alert("Name cannot be empty.");
    return;
  }

  if (section.names.includes(trimmedName)) {
    alert(`${trimmedName} is already in the ${section.title} section.`);
    return;
  }

  section.names.push(trimmedName);
  saveState();
  buildTable();
}

function removeName() {
  const sectionTitle = prompt(
    "Enter the section name for the name you want to remove:"
  );
  if (!sectionTitle) return;

  const normalizedTitle = sectionTitle.trim().toUpperCase();
  if (!normalizedTitle) {
    alert("Section name cannot be empty.");
    return;
  }

  const section = attendanceData.sections.find(
    (s) => s.title.toUpperCase() === normalizedTitle
  );
  if (!section) {
    alert(`Section "${normalizedTitle}" not found.`);
    return;
  }

  const name = prompt(`Enter the name to remove from ${section.title}:`);
  if (!name) return;

  const trimmedName = name.trim().toUpperCase();
  if (!trimmedName) {
    alert("Name cannot be empty.");
    return;
  }

  const index = section.names.findIndex((n) => n.toUpperCase() === trimmedName);
  if (index === -1) {
    alert(`${trimmedName} is not in the ${section.title} section.`);
    return;
  }

  section.names.splice(index, 1);

  if (section.names.length === 0) {
    attendanceData.sections = attendanceData.sections.filter(
      (s) => s !== section
    );
  }

  attendanceData.dates.forEach((date) => {
    const recordKey = `${trimmedName}|${date}`;
    delete attendanceData.records[recordKey];
  });

  saveState();
  buildTable();
}

function clearAttendance() {
  if (!confirm("Reset all attendance marks?")) return;
  attendanceData.records = {};
  saveState();
  buildTable();
}

addDateBtn.addEventListener("click", addDate);
addNameBtn.addEventListener("click", addName);
removeNameBtn.addEventListener("click", removeName);
exportCsvBtn.addEventListener("click", exportCsv);
exportPhotoBtn.addEventListener("click", exportPhoto);
clearDataBtn.addEventListener("click", clearAttendance);

buildTable();
