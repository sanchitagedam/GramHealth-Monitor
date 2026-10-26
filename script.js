
const STORAGE_KEY = "gramHealthMonitorData";

const defaultFacilities = [
    {
        id: 1,
        name: "Rampur Primary Health Centre",
        block: "Rampur",
        doctors: 2,
        nurses: 4,
        medicine: "Available",
        equipment: "Functional",
        infrastructure: "Good",
        services: "Available"
    },
    {
        id: 2,
        name: "Shivpur Health Centre",
        block: "Shivpur",
        doctors: 1,
        nurses: 3,
        medicine: "Low",
        equipment: "Partially Functional",
        infrastructure: "Good",
        services: "Available"
    },
    {
        id: 3,
        name: "Lakshmi Rural Clinic",
        block: "Lakshmi",
        doctors: 0,
        nurses: 2,
        medicine: "Out of Stock",
        equipment: "Non-functional",
        infrastructure: "Needs Repair",
        services: "Limited"
    },
    {
        id: 4,
        name: "Devgaon Health Centre",
        block: "Devgaon",
        doctors: 3,
        nurses: 5,
        medicine: "Available",
        equipment: "Functional",
        infrastructure: "Good",
        services: "Available"
    }
];

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (saved && Array.isArray(saved.facilities)) {
            return {
                facilities: saved.facilities,
                issues: Array.isArray(saved.issues) ? saved.issues : [],
                reports: Array.isArray(saved.reports) ? saved.reports : []
            };
        }
    } catch (error) {
        console.warn("Saved demo data could not be loaded.", error);
    }

    return {
        facilities: defaultFacilities.map(facility => ({ ...facility })),
        issues: [
            {
                id: 1,
                facilityId: 2,
                title: "Low medicine stock",
                priority: "Medium",
                assignedTo: "Block Health Officer",
                date: new Date().toISOString().slice(0, 10),
                status: "Pending"
            },
            {
                id: 2,
                facilityId: 3,
                title: "Doctor shortage",
                priority: "Critical",
                assignedTo: "District Health Team",
                date: new Date().toISOString().slice(0, 10),
                status: "Pending"
            },
            {
                id: 3,
                facilityId: 3,
                title: "Equipment not functional",
                priority: "High",
                assignedTo: "Maintenance Team",
                date: new Date().toISOString().slice(0, 10),
                status: "Assigned"
            }
        ],
        reports: []
    };
}

const data = loadData();

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        alert("The browser could not save the data. Check your browser storage settings.");
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getFacility(id) {
    return data.facilities.find(facility => facility.id === Number(id));
}

function facilityStatus(facility) {
    if (
        facility.doctors === 0 ||
        facility.medicine === "Out of Stock" ||
        facility.equipment === "Non-functional" ||
        facility.services === "Unavailable"
    ) {
        return "Critical";
    }

    if (
        facility.doctors < 2 ||
        facility.medicine === "Low" ||
        facility.equipment === "Partially Functional" ||
        facility.infrastructure === "Needs Repair" ||
        facility.services === "Limited"
    ) {
        return "Needs Attention";
    }

    return "Good";
}

function statusBadge(status) {
    let className = "badge-good";

    if (["Critical", "High", "Out of Stock", "Non-functional"].includes(status)) {
        className = "badge-critical";
    } else if (
        ["Medium", "Low", "Needs Attention", "Needs Repair",
         "Partially Functional", "Limited"].includes(status)
    ) {
        className = "badge-warning";
    } else if (status === "Assigned") {
        className = "badge-assigned";
    } else if (status === "Resolved") {
        className = "badge-resolved";
    } else if (status === "Pending") {
        className = "badge-pending";
    }

    return `<span class="status-badge ${className}">${escapeHTML(status)}</span>`;
}

function renderDashboard() {
    document.getElementById("totalFacilities").textContent =
        data.facilities.length;

    document.getElementById("attentionFacilities").textContent =
        data.facilities.filter(facility =>
            facilityStatus(facility) !== "Good"
        ).length;

    document.getElementById("openIssues").textContent =
        data.issues.filter(issue => issue.status !== "Resolved").length;

    document.getElementById("resolvedIssues").textContent =
        data.issues.filter(issue => issue.status === "Resolved").length;

    document.getElementById("dashboardTable").innerHTML =
        data.facilities.map(facility => `
            <tr>
                <td>${escapeHTML(facility.name)}</td>
                <td>${escapeHTML(facility.block)}</td>
                <td>${facility.doctors}</td>
                <td>${statusBadge(facility.medicine)}</td>
                <td>${statusBadge(facility.equipment)}</td>
                <td>${statusBadge(facilityStatus(facility))}</td>
            </tr>
        `).join("");

    const recentIssues = [...data.issues].slice(-4).reverse();
    const recentContainer = document.getElementById("recentIssues");

    if (recentIssues.length === 0) {
        recentContainer.innerHTML =
            `<p class="empty-state">No issues recorded yet.</p>`;
    } else {
        recentContainer.innerHTML = recentIssues.map(issue => {
            const facility = getFacility(issue.facilityId);

            return `
                <div class="issue-item">
                    <div>
                        <strong>${escapeHTML(issue.title)}</strong>
                        <p class="muted">
                            ${escapeHTML(facility?.name || "Unknown facility")}
                        </p>
                    </div>
                    <div>
                        ${statusBadge(issue.priority)}
                        ${statusBadge(issue.status)}
                    </div>
                </div>
            `;
        }).join("");
    }
}

function renderFacilities() {
    const search = document.getElementById("facilitySearch").value
        .trim().toLowerCase();

    const filtered = data.facilities.filter(facility =>
        `${facility.name} ${facility.block}`.toLowerCase().includes(search)
    );

    document.getElementById("facilitiesTable").innerHTML =
        filtered.map(facility => `
            <tr>
                <td>${escapeHTML(facility.name)}</td>
                <td>${escapeHTML(facility.block)}</td>
                <td>${facility.doctors}</td>
                <td>${facility.nurses}</td>
                <td>${statusBadge(facility.medicine)}</td>
                <td>${statusBadge(facility.infrastructure)}</td>
                <td>${statusBadge(facilityStatus(facility))}</td>
            </tr>
        `).join("") || `
            <tr><td colspan="7">No matching facilities found.</td></tr>
        `;

    const select = document.getElementById("reportFacility");
    const previousValue = select.value;

    select.innerHTML = data.facilities.map(facility => `
        <option value="${facility.id}">
            ${escapeHTML(facility.name)}
        </option>
    `).join("");

    if (data.facilities.some(facility => String(facility.id) === previousValue)) {
        select.value = previousValue;
    }
}

function detectIssues(facility) {
    const detected = [];

    if (facility.doctors < 2) {
        detected.push({
            title: "Doctor shortage",
            priority: facility.doctors === 0 ? "Critical" : "High"
        });
    }

    if (facility.medicine === "Out of Stock") {
        detected.push({ title: "Medicine out of stock", priority: "Critical" });
    } else if (facility.medicine === "Low") {
        detected.push({ title: "Low medicine stock", priority: "Medium" });
    }

    if (facility.equipment === "Non-functional") {
        detected.push({ title: "Equipment not functional", priority: "High" });
    } else if (facility.equipment === "Partially Functional") {
        detected.push({ title: "Equipment needs maintenance", priority: "Medium" });
    }

    if (facility.infrastructure === "Needs Repair") {
        detected.push({ title: "Infrastructure needs repair", priority: "Medium" });
    }

    if (facility.services === "Unavailable") {
        detected.push({ title: "Health services unavailable", priority: "Critical" });
    } else if (facility.services === "Limited") {
        detected.push({ title: "Limited health services", priority: "Medium" });
    }

    return detected;
}

function renderIssues() {
    document.getElementById("issuesTable").innerHTML =
        data.issues.map(issue => {
            const facility = getFacility(issue.facilityId);

            return `
                <tr>
                    <td>${escapeHTML(issue.title)}</td>
                    <td>${escapeHTML(facility?.name || "Unknown facility")}</td>
                    <td>${statusBadge(issue.priority)}</td>
                    <td>${escapeHTML(issue.assignedTo || "Unassigned")}</td>
                    <td>${escapeHTML(issue.date)}</td>
                    <td>
                        <select class="issue-status-select"
                                data-issue-id="${issue.id}"
                                aria-label="Update status for ${escapeHTML(issue.title)}">
                            ${["Pending", "Assigned", "Resolved"].map(status => `
                                <option value="${status}"
                                    ${issue.status === status ? "selected" : ""}>
                                    ${status}
                                </option>
                            `).join("")}
                        </select>
                    </td>
                </tr>
            `;
        }).join("") || `
            <tr><td colspan="6">No issues recorded yet.</td></tr>
        `;
}

function renderReports() {
    document.getElementById("reportsTable").innerHTML =
        [...data.reports].reverse().map(report => {
            const facility = getFacility(report.facilityId);

            return `
                <tr>
                    <td>${escapeHTML(facility?.name || "Unknown facility")}</td>
                    <td>${escapeHTML(report.date)}</td>
                    <td>${report.doctors}</td>
                    <td>${statusBadge(report.medicine)}</td>
                    <td>${statusBadge(report.equipment)}</td>
                    <td>${escapeHTML(report.detectedIssues.join(", ") || "None")}</td>
                </tr>
            `;
        }).join("") || `
            <tr><td colspan="6">No reports submitted yet.</td></tr>
        `;
}

function renderAll() {
    renderDashboard();
    renderFacilities();
    renderIssues();
    renderReports();
}

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle("active", page.id === pageId);
    });

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageId);
    });
}

document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.go));
});

document.getElementById("facilitySearch").addEventListener("input", renderFacilities);

document.getElementById("reportForm").addEventListener("submit", event => {
    event.preventDefault();

    const facilityId = Number(document.getElementById("reportFacility").value);
    const facility = getFacility(facilityId);

    if (!facility) {
        alert("Please select a health facility.");
        return;
    }

    facility.doctors = Number(document.getElementById("doctors").value);
    facility.nurses = Number(document.getElementById("nurses").value);
    facility.medicine = document.getElementById("medicine").value;
    facility.equipment = document.getElementById("equipment").value;
    facility.infrastructure = document.getElementById("infrastructure").value;
    facility.services = document.getElementById("services").value;

    const detected = detectIssues(facility);
    const date = new Date().toISOString().slice(0, 10);

    data.reports.push({
        id: Date.now(),
        facilityId,
        date,
        doctors: facility.doctors,
        nurses: facility.nurses,
        medicine: facility.medicine,
        equipment: facility.equipment,
        infrastructure: facility.infrastructure,
        services: facility.services,
        notes: document.getElementById("reportNotes").value.trim(),
        detectedIssues: detected.map(issue => issue.title)
    });

    detected.forEach(found => {
        const alreadyOpen = data.issues.some(issue =>
            issue.facilityId === facilityId &&
            issue.title === found.title &&
            issue.status !== "Resolved"
        );

        if (!alreadyOpen) {
            data.issues.push({
                id: Date.now() + Math.floor(Math.random() * 100000),
                facilityId,
                title: found.title,
                priority: found.priority,
                assignedTo: "District Health Team",
                date,
                status: "Pending"
            });
        }
    });

    saveData();
    renderAll();
    document.getElementById("reportForm").reset();

    alert(
        `Report submitted for ${facility.name}.\n` +
        `${detected.length} potential issue(s) detected.\n\n` +
        "This is a demonstration only; findings need human verification."
    );

    showPage("dashboard");
});

document.getElementById("issuesTable").addEventListener("change", event => {
    const select = event.target.closest(".issue-status-select");
    if (!select) return;

    const issue = data.issues.find(item =>
        item.id === Number(select.dataset.issueId)
    );

    if (issue) {
        issue.status = select.value;
        saveData();
        renderAll();
    }
});

function downloadCSV(filename, rows) {
    if (rows.length === 0) {
        alert("There is no data to export yet.");
        return;
    }

    const csv = rows.map(row =>
        row.map(value => {
            let text = String(value ?? "");

            // Prevent spreadsheet formula execution in exported text.
            if (/^[=+\-@]/.test(text)) text = "'" + text;

            return `"${text.replace(/"/g, '""')}"`;
        }).join(",")
    ).join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

document.getElementById("exportIssues").addEventListener("click", () => {
    const rows = [
        ["Issue", "Facility", "Priority", "Assigned To", "Date", "Status"],
        ...data.issues.map(issue => [
            issue.title,
            getFacility(issue.facilityId)?.name || "Unknown facility",
            issue.priority,
            issue.assignedTo,
            issue.date,
            issue.status
        ])
    ];

    downloadCSV("gramhealth-issues.csv", rows);
});

document.getElementById("exportReports").addEventListener("click", () => {
    const rows = [
        [
            "Facility", "Date", "Doctors", "Nurses", "Medicine",
            "Equipment", "Infrastructure", "Services", "Detected Issues", "Notes"
        ],
        ...data.reports.map(report => [
            getFacility(report.facilityId)?.name || "Unknown facility",
            report.date,
            report.doctors,
            report.nurses,
            report.medicine,
            report.equipment,
            report.infrastructure,
            report.services,
            report.detectedIssues.join("; "),
            report.notes
        ])
    ];

    downloadCSV("gramhealth-reports.csv", rows);
});

renderAll();
