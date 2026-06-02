(function () {
    const EDUCATION_ICON_BY_INSTITUTION = {
        "University of Oregon": "img/college/uo/icon/oregon-duck.png",
        "Goshen College": "img/college/gc/icon/gc-maple-leaf.png"
    };

    const TECH_CATEGORY_ICON_BY_LABEL = {
        "Languages": "fa-solid fa-code",
        "Web Frameworks": "fa-solid fa-globe",
        "Database": "fa-solid fa-database",
        "Cloud Technologies": "fa-solid fa-cloud",
        "ML & Data Analytics": "fa-solid fa-brain",
        "GUI Framework": "fa-solid fa-display",
        "Frameworks/Libraries": "fa-solid fa-project-diagram"
    };

    const TECH_ICON_BY_NAME = {
        "Apache ECharts": "devicon-apache-plain",
        "AWS": "devicon-amazonwebservices-plain",
        "Bash": "devicon-bash-plain",
        "Bulma": "devicon-bulma-plain",
        "C": "devicon-c-plain",
        "D3.js": "devicon-d3js-plain",
        "Dask": "icomoon-dask path1",
        "DGL": "devicon-python-plain",
        "Django": "devicon-django-plain",
        "Elasticsearch": "devicon-elasticsearch-plain",
        "Flask": "devicon-flask-original",
        "GeoPandas": "icomoon-geopandas",
        "JavaScript": "devicon-javascript-plain",
        "Leaflet.js": "fa-solid fa-map",
        "MPI4Py": "icomoon-mpi",
        "Matplotlib": "devicon-matplotlib-plain",
        "Microsoft Excel": "fa-solid fa-table",
        "MySQL": "devicon-mysql-plain",
        "NLTK": "devicon-python-plain",
        "NumPy": "devicon-numpy-plain",
        "Pandas": "devicon-pandas-plain",
        "Power BI": "fa-solid fa-chart-simple",
        "PostgreSQL": "devicon-postgresql-plain",
        "PyPDF2": "devicon-python-plain",
        "PyQT": "devicon-qt-plain",
        "PyTorch": "devicon-pytorch-plain",
        "Python": "devicon-python-plain",
        "SQL": "devicon-azuresqldatabase-plain",
        "SQL Server": "devicon-microsoftsqlserver-plain",
        "SSRS": "devicon-azuresqldatabase-plain",
        "Scikit-learn": "devicon-scikitlearn-plain",
        "SciPy": "icomoon-scipy",
        "SQLite": "devicon-sqlite-plain",
        "Sqlite3": "devicon-sqlite-plain"
    };

    const modalConfigs = [
        {
            prefix: "we",
            timelineId: "we-timeline",
            contentPanelId: "we-content-panel",
            loadItems: () => fetchJson("data/work-experience.json"),
            renderTimelineItem: renderWorkTimelineItem,
            renderContentSection: renderWorkContentSection,
            filters: {
                enumFilters: [
                    {
                        containerId: "we-timeline-sector-filter-options",
                        itemKey: "sector"
                    }
                ],
                techContainerId: "we-timeline-technology-filter-options"
            }
        },
        {
            prefix: "ed",
            timelineId: "ed-timeline",
            contentPanelId: "ed-content-panel",
            loadItems: () => fetchJson("data/education.json"),
            renderTimelineItem: renderEducationTimelineItem,
            renderContentSection: renderEducationContentSection
        },
        {
            prefix: "projects",
            timelineId: "projects-timeline",
            contentPanelId: "projects-content-panel",
            loadItems: () => fetchJson("data/projects.json"),
            renderTimelineItem: renderProjectsTimelineItem,
            renderContentSection: renderProjectsContentSection,
            filters: {
                enumFilters: [
                    {
                        containerId: "projects-timeline-type-filter-options",
                        itemKey: "type"
                    }
                ],
                techContainerId: "projects-timeline-technology-filter-options"
            }
        },
        {
            prefix: "publications",
            timelineId: "publications-timeline",
            contentPanelId: "publications-content-panel",
            loadItems: loadPublications,
            renderTimelineItem: renderPublicationsTimelineItem,
            renderContentSection: renderPublicationsContentSection,
            filters: {
                enumFilters: [
                    {
                        containerId: "publications-timeline-type-filter-options",
                        itemKey: "type"
                    }
                ]
            }
        },
        {
            prefix: "talks",
            timelineId: "talks-timeline",
            contentPanelId: "talks-content-panel",
            loadItems: () => fetchJson("data/talks.json"),
            renderTimelineItem: renderTalksTimelineItem,
            renderContentSection: renderTalksContentSection
        },
        {
            prefix: "service",
            timelineId: "service-timeline",
            contentPanelId: "service-content-panel",
            loadItems: () => fetchJson("data/leadership.json"),
            renderTimelineItem: renderServiceTimelineItem,
            renderContentSection: renderServiceContentSection
        }
    ];

    async function fetchJson(path) {
        try {
            const response = await fetch(path);

            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            if (window.location.protocol !== "file:") {
                throw error;
            }

            try {
                return await loadJsonFromLocalFile(path);
            } catch (fallbackError) {
                showLocalFileWarning();
                throw fallbackError;
            }
        }
    }

    function loadJsonFromLocalFile(path) {
        return new Promise((resolve, reject) => {
            const iframe = document.createElement("iframe");
            const cleanup = () => {
                iframe.remove();
            };

            const fail = (message) => {
                cleanup();
                reject(new Error(`Failed to load ${path} from file:// fallback: ${message}`));
            };

            const timer = window.setTimeout(() => {
                fail("timed out waiting for iframe load");
            }, 3000);

            iframe.style.display = "none";
            iframe.src = path;

            iframe.onload = () => {
                window.clearTimeout(timer);

                try {
                    const text = iframe.contentDocument?.body?.textContent?.trim();

                    if (!text) {
                        fail("empty response body");
                        return;
                    }

                    cleanup();
                    resolve(JSON.parse(text));
                } catch (error) {
                    fail(error.message);
                }
            };

            iframe.onerror = () => {
                window.clearTimeout(timer);
                fail("iframe load error");
            };

            document.body.appendChild(iframe);
        });
    }

    function showLocalFileWarning() {
        if (document.getElementById("local-file-warning")) {
            return;
        }

        const warning = document.createElement("div");
        const title = document.createElement("strong");
        const message = document.createElement("span");

        warning.id = "local-file-warning";
        warning.className = "notification is-warning mx-4 mt-4";
        title.textContent = "Local file mode is restricted by the browser. ";
        message.textContent = "Open the site through a local server, for example: python3 -m http.server 8123, then visit http://localhost:8123/.";

        warning.appendChild(title);
        warning.appendChild(message);
        document.body.prepend(warning);
    }

    async function loadPublications() {
        const items = await fetchJson("data/publications.json");
        return items.sort((left, right) => getItemTimestamp(right) - getItemTimestamp(left));
    }

    function getItemTimestamp(item) {
        return parseDateValue(item.from || item.date)?.getTime() || 0;
    }

    function parseDateValue(value) {
        if (!value) {
            return null;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return new Date(`${value}T00:00:00`);
        }

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            const [month, day, year] = value.split("/").map(Number);
            return new Date(year, month - 1, day);
        }

        return Number.isNaN(Date.parse(value)) ? null : new Date(value);
    }

    function formatMonthYear(value) {
        if (!value) {
            return "";
        }

        if (/^\d{2}\/\d{4}$/.test(value)) {
            return value;
        }

        const parsedDate = parseDateValue(value);

        if (!parsedDate) {
            return value;
        }

        const month = `${parsedDate.getMonth() + 1}`.padStart(2, "0");
        const year = parsedDate.getFullYear();
        return `${month}/${year}`;
    }

    function formatTimelineDate(value) {
        const parsedDate = parseDateValue(value);

        if (!parsedDate) {
            return value;
        }

        const month = `${parsedDate.getMonth() + 1}`.padStart(2, "0");
        const day = `${parsedDate.getDate()}`.padStart(2, "0");
        const year = parsedDate.getFullYear();
        return `${month}/${day}/${year}`;
    }

    function formatDateRange(from, to) {
        const start = formatMonthYear(from);
        const end = to ? formatMonthYear(to) : "Present";

        if (!start) {
            return end === "Present" ? "" : end;
        }

        return `${start} - ${end}`;
    }

    function formatWorkDateRange(item) {
        return formatDateRange(item.from, item.to);
    }

    function formatCardDate(entry) {
        if (entry.from || entry.to) {
            return formatDateRange(entry.from, entry.to);
        }

        return formatTimelineDate(entry.date);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function jsonAttribute(value) {
        return escapeAttribute(JSON.stringify(value || {}));
    }

    function slugify(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function getTabSetKey(sectionId, slug) {
        return `${sectionId.replace(/-/g, "")}${slugify(slug)}`;
    }

    function renderStructuredSections(prefix, sections, item, sectionId) {
        return (sections || []).map((section) => renderStructuredSection(prefix, section, item, sectionId)).join("");
    }

    function renderStructuredSection(prefix, section, item, sectionId) {
        const wrapperClass = `${prefix}-content-section-${section.slug}`;

        if (section.type === "paragraphs") {
            return `
                <hr class="${prefix}-content-section-divider">
                <div class="${wrapperClass}">
                    <h3 class="${prefix}-content-section-title">${escapeHtml(section.title)}</h3>
                    ${(section.paragraphs || []).map((paragraph) => `<p>${renderRichText(paragraph)}</p>`).join("")}
                </div>
            `;
        }

        if (section.type === "bullets") {
            return `
                <hr class="${prefix}-content-section-divider">
                <div class="${wrapperClass}">
                    <h3 class="${prefix}-content-section-title">${escapeHtml(section.title)}</h3>
                    <ul>
                        ${(section.items || []).map((entry) => renderBulletItem(entry)).join("")}
                    </ul>
                </div>
            `;
        }

        if (section.type === "image") {
            return `
                <hr class="${prefix}-content-section-divider">
                <div class="${wrapperClass}">
                    <figure class="image">
                        <img src="${escapeAttribute(section.src)}" alt="${escapeAttribute(section.alt || "")}">
                        ${section.caption ? `<figcaption>${escapeHtml(section.caption)}</figcaption>` : ""}
                    </figure>
                </div>
            `;
        }

        if (section.type === "links") {
            return `
                <hr class="${prefix}-content-section-divider">
                <div class="${wrapperClass}">
                    <h3 class="${prefix}-content-section-title">${escapeHtml(section.title)}</h3>
                    ${renderLinksSection(section)}
                </div>
            `;
        }

        if (section.type === "tags") {
            return `
                <hr class="${prefix}-content-section-divider">
                <div class="${wrapperClass}">
                    <h3 class="${prefix}-content-section-title">${escapeHtml(section.title)}</h3>
                    <div class="tags">
                        ${(section.values || []).map((value) => `<span class="tag is-rounded is-success has-text-black">${escapeHtml(value)}</span>`).join("")}
                    </div>
                </div>
            `;
        }

        if (section.type === "tech") {
            return renderTechSection(prefix, section, item, sectionId);
        }

        if (section.type === "accordion-list") {
            return renderAccordionListSection(prefix, section);
        }

        if (section.type === "tabbed-icon-list") {
            return renderTabbedIconListSection(prefix, section, sectionId);
        }

        if (section.type === "cards") {
            return renderCardsSection(prefix, section);
        }

        if (section.type === "gallery") {
            return renderGallerySection(prefix, section, sectionId);
        }

        return "";
    }

    function renderBulletItem(entry) {
        return `
            <li>
                ${entry.icon ? `<i class="${escapeAttribute(entry.icon)}"></i> ` : ""}${renderRichText(entry.text)}
            </li>
        `;
    }

    function renderRichText(value) {
        if (Array.isArray(value)) {
            return value.map((segment) => renderRichTextSegment(segment)).join("");
        }

        return renderRichTextSegment(value);
    }

    function renderRichTextSegment(segment) {
        if (segment === null || segment === undefined) {
            return "";
        }

        if (typeof segment === "string") {
            return escapeHtml(segment);
        }

        if (typeof segment === "object") {
            const text = escapeHtml(segment.text || "");

            if (segment.highlight) {
                return `<span class="highlight">${text}</span>`;
            }

            return text;
        }

        return escapeHtml(String(segment));
    }

    function renderLinksSection(section) {
        if (section.links?.length) {
            return section.links.map((link) => {
                const className = link.button ? ' class="button is-link is-rounded"' : "";
                const target = link.external ? ' target="_blank"' : "";
                const icon = link.icon ? ` <i class="${escapeAttribute(link.icon)}"></i>` : "";
                return `<a${className} href="${escapeAttribute(link.url || "")}"${target}>${escapeHtml(link.label)}${icon}</a>`;
            }).join("");
        }

        if (section.emptyText) {
            return `<p class="talks-not-available">${escapeHtml(section.emptyText)}</p>`;
        }

        return "";
    }

    function renderTechSection(prefix, section, item, sectionId) {
        const techEntries = Object.entries(item.tech || {});
        const tabSetKey = getTabSetKey(sectionId, section.slug);

        return `
            <hr class="${prefix}-content-section-divider">
            <div class="${prefix}-content-section-tech-stack">
                <h3 class="${prefix}-content-section-title">${escapeHtml(section.title)}</h3>
                <div class="tabs ${prefix}-content-section-tech-stack-tabs">
                    <ul>
                        ${techEntries.map(([category], index) => {
                            const targetId = `${prefix}-content-section-${section.slug}-tab-${slugify(category)}-${tabSetKey}`;
                            const iconClass = TECH_CATEGORY_ICON_BY_LABEL[category] || "fa-solid fa-code";
                            return `
                                <li${index === 0 ? ' class="is-active"' : ""} data-target="${escapeAttribute(targetId)}">
                                    <a><span class="icon is-small"><i class="${escapeAttribute(iconClass)}"></i></span><span>${escapeHtml(category)}</span></a>
                                </li>
                            `;
                        }).join("")}
                    </ul>
                </div>
                ${techEntries.map(([category, values], index) => {
                    const targetId = `${prefix}-content-section-${section.slug}-tab-${slugify(category)}-${tabSetKey}`;
                    return `
                        <div class="tab-content" id="${escapeAttribute(targetId)}"${index > 0 ? ' style="display: none;"' : ""}>
                            ${values.map((value) => renderTechIcon(prefix, value)).join("")}
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderTechIcon(prefix, value) {
        const iconClass = TECH_ICON_BY_NAME[value] || "fa-solid fa-code";
        return `
            <div class="${prefix}-content-section-tech-stack-icon">
                <i class="${escapeAttribute(iconClass)}"></i>
                <p>${escapeHtml(value)}</p>
            </div>
        `;
    }

    function renderAccordionListSection(prefix, section) {
        const detailClass = `${prefix}-content-section-${section.slug}-details`;
        const descriptionClass = `${prefix}-content-section-${section.slug}-description`;
        const linkContainerClass = `${prefix}-content-section-${section.slug}-github-container`;
        const linkClass = `${prefix}-content-section-${section.slug}-github`;

        return `
            <hr class="${prefix}-content-section-divider">
            <div class="${prefix}-content-section-${section.slug}">
                <h3 class="${prefix}-content-section-title">${escapeHtml(section.title)}</h3>
                <ul>
                    ${(section.items || []).map((entry) => `
                        <li>
                            ${entry.icon ? `<i class="${escapeAttribute(entry.icon)}"></i> ` : ""}${escapeHtml(entry.title)}
                            ${(entry.tags || []).map((tag) => `<span class="tag is-success is-rounded has-text-weight-bold has-text-black">${escapeHtml(tag)}</span>`).join("")}
                        </li>
                        <div class="${detailClass}" style="display: none;">
                            <p class="${descriptionClass}">${entry.description}</p>
                            ${entry.links?.length ? `
                                <div class="${linkContainerClass}">
                                    ${entry.links.map((link) => `<a class="${linkClass}" href="${escapeAttribute(link.url)}" target="_blank">${link.icon ? `<i class="${escapeAttribute(link.icon)}"></i>` : ""}${escapeHtml(link.label)}</a>`).join("")}
                                </div>
                            ` : ""}
                        </div>
                    `).join("")}
                </ul>
            </div>
        `;
    }

    function renderTabbedIconListSection(prefix, section, sectionId) {
        const tabSetKey = getTabSetKey(sectionId, section.slug);
        const groups = section.groups || [];
        const hasTabs = groups.length > 1;

        return `
            <hr class="${prefix}-content-section-divider">
            <div class="${prefix}-content-section-${section.slug}">
                <h3 class="${prefix}-content-section-title">${escapeHtml(section.title)}</h3>
                ${hasTabs ? `
                    <div class="tabs ${prefix}-content-section-tech-stack-tabs">
                        <ul>
                            ${groups.map((group, index) => {
                                const targetId = `${prefix}-content-section-${section.slug}-tab-${slugify(group.key || group.label || index)}-${tabSetKey}`;
                                return `
                                    <li${index === 0 ? ' class="is-active"' : ""} data-target="${escapeAttribute(targetId)}">
                                        <a><span class="icon is-small">${group.icon ? `<i class="${escapeAttribute(group.icon)}"></i>` : ""}</span><span>${escapeHtml(group.label)}</span></a>
                                    </li>
                                `;
                            }).join("")}
                        </ul>
                    </div>
                ` : ""}
                ${groups.map((group, index) => {
                    const targetId = `${prefix}-content-section-${section.slug}-tab-${slugify(group.key || group.label || index)}-${tabSetKey}`;
                    return `
                        <div class="tab-content"${hasTabs ? ` id="${escapeAttribute(targetId)}"` : ""}${hasTabs && index > 0 ? ' style="display: none;"' : ""}>
                            ${(group.items || []).map((entry) => `
                                <div class="${prefix}-content-section-${section.slug}-icon">
                                    ${entry.icon ? `<i class="${escapeAttribute(entry.icon)}"></i>` : ""}
                                    <span class="${prefix}-content-section-${section.slug}-info">${escapeHtml(entry.label)}</span>
                                </div>
                            `).join("")}
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderCardsSection(prefix, section) {
        const slug = section.slug;
        return `
            <hr class="${prefix}-content-section-divider">
            <div class="${prefix}-content-section-${slug}">
                <h3 class="${prefix}-content-section-title">${escapeHtml(section.title)}</h3>
                <div class="${slug}-cards">
                    ${(section.items || []).map((entry) => `
                        <div class="${slug}-card">
                            <div class="${slug}-date">
                                <i class="fa-regular fa-calendar"></i>
                                ${escapeHtml(formatCardDate(entry))}
                            </div>
                            <div class="${slug}-details">
                                <div class="${slug}-role">${escapeHtml(entry.title)}</div>
                                <div class="${slug}-company">
                                    ${entry.icon ? `<i class="${escapeAttribute(entry.icon)}"></i>` : ""}
                                    ${escapeHtml(entry.subtitle)}
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    function renderGallerySection(prefix, section, sectionId) {
        const galleryId = `${prefix}-${slugify(section.slug)}-${sectionId}`;
        return `
            <hr class="${prefix}-content-section-divider">
            <div class="${prefix}-content-section-${section.slug}">
                <h3 class="${prefix}-content-section-title">${escapeHtml(section.title)}</h3>
                <div class="container">
                    <div class="columns is-multiline">
                        ${(section.images || []).map((image) => `
                            <div class="column is-one-fifth p-1">
                                <figure class="image is-1by1">
                                    <a href="${escapeAttribute(image.full)}" data-fancybox="${escapeAttribute(galleryId)}" data-caption="${escapeAttribute(image.caption || "")}">
                                        <img src="${escapeAttribute(image.thumb || image.full)}" class="custom-image">
                                    </a>
                                </figure>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    function renderWorkTimelineItem(item, sectionId) {
        return `
            <div class="timeline-item" data-sector="${escapeAttribute(item.sector)}" data-from="${escapeAttribute(item.from)}" data-to="${escapeAttribute(item.to || "")}" data-technology='${jsonAttribute(item.tech)}'>
                <div class="timeline-dot" style="display: none;"></div>
                <div class="timeline-date"><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatWorkDateRange(item))}</div>
                <div class="timeline-content">
                    <a class="timeline-content-link" href="#" data-section-id="${escapeAttribute(sectionId)}">
                        <div class="timeline-content-details">
                            <div class="timeline-content-title">${escapeHtml(item.role)}</div>
                            <div class="timeline-content-company">${escapeHtml(item.company)}</div>
                            <span class="tag is-rounded is-danger"><strong>${escapeHtml(item.sector)}</strong></span>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }

    function renderWorkContentSection(item, sectionId) {
        return `
            <div class="we-content-section" id="${escapeAttribute(sectionId)}" style="display: none;">
                <h2 class="title we-content-title">${escapeHtml(item.role)}</h2>
                <h4 class="subtitle we-content-subtitle">
                    <i class="fa-solid fa-building"></i> ${escapeHtml(item.company)}
                </h4>
                <h4 class="subtitle we-content-subtitle">
                    <i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatWorkDateRange(item))}
                </h4>
                <h4 class="subtitle we-content-subtitle">
                    <i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}
                </h4>
                ${renderStructuredSections("we", item.sections, item, sectionId)}
            </div>
        `;
    }

    function renderEducationTimelineItem(item, sectionId) {
        const iconPath = item.icon || EDUCATION_ICON_BY_INSTITUTION[item.institution] || "";
        const institutionMarkup = iconPath
            ? `<span><img src="${escapeAttribute(iconPath)}" class="ed-icon">${escapeHtml(item.institution)}</span>`
            : escapeHtml(item.institution);

        return `
            <div class="timeline-item">
                <div class="timeline-dot" style="display: none;"></div>
                <div class="timeline-date"><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatDateRange(item.from, item.to))}</div>
                <div class="timeline-content">
                    <a class="timeline-content-link" href="#" data-section-id="${escapeAttribute(sectionId)}">
                        <div class="timeline-content-details">
                            <div class="timeline-content-title">${escapeHtml(item.degree)}</div>
                            <div class="timeline-content-college">${institutionMarkup}</div>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }

    function renderEducationContentSection(item, sectionId) {
        return `
            <div class="ed-content-section" id="${escapeAttribute(sectionId)}" style="display: none;">
                <h2 class="title ed-content-title">${escapeHtml(item.degree)}</h2>
                <h4 class="subtitle ed-content-subtitle">
                    <i class="fa-solid fa-building-columns"></i> ${escapeHtml(item.institution)}
                </h4>
                <h4 class="subtitle ed-content-subtitle">
                    <i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatDateRange(item.from, item.to))}
                </h4>
                <h4 class="subtitle ed-content-subtitle">
                    <i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}
                </h4>
                ${renderStructuredSections("ed", item.sections, item, sectionId)}
            </div>
        `;
    }

    function renderProjectsTimelineItem(item, sectionId) {
        return `
            <div class="timeline-item" data-type="${escapeAttribute(item.type)}" data-technology='${jsonAttribute(item.tech)}'>
                <div class="timeline-dot" style="display: none;"></div>
                <div class="timeline-date"><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatMonthYear(item.date))}</div>
                <div class="timeline-content">
                    <a class="timeline-content-link" href="#" data-section-id="${escapeAttribute(sectionId)}">
                        <div class="timeline-content-details">
                            <div class="timeline-content-title">${escapeHtml(item.title)}</div>
                            <span class="tag is-rounded is-danger"><strong>${escapeHtml(item.type)}</strong></span>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }

    function renderProjectsContentSection(item, sectionId) {
        return `
            <div class="projects-content-section" id="${escapeAttribute(sectionId)}" style="display: none;">
                <h2 class="title projects-content-title">${escapeHtml(item.title)}</h2>
                <h4 class="subtitle projects-content-subtitle">
                    <i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatMonthYear(item.date))}
                </h4>
                ${renderStructuredSections("projects", item.sections, item, sectionId)}
            </div>
        `;
    }

    function renderPublicationsTimelineItem(item, sectionId) {
        return `
            <div class="timeline-item" data-type="${escapeAttribute(item.type)}">
                <div class="timeline-dot" style="display: none;"></div>
                <div class="timeline-date"><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatTimelineDate(item.date))}</div>
                <div class="timeline-content">
                    <a class="timeline-content-link" href="#" data-section-id="${escapeAttribute(sectionId)}">
                        <div class="timeline-content-details">
                            <div class="timeline-content-title">${escapeHtml(item.title)}</div>
                            <span class="tag is-rounded is-danger"><strong>${escapeHtml(formatPublicationTypeLabel(item.type))}</strong></span>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }

    function renderPublicationsContentSection(item, sectionId) {
        return `
            <div class="publications-content-section" id="${escapeAttribute(sectionId)}" style="display: none;">
                <h2 class="title publications-content-title">${escapeHtml(item.title)}</h2>
                <h4 class="subtitle publications-content-subtitle">
                    <i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatTimelineDate(item.date))}
                </h4>
                <h4 class="subtitle publications-content-subtitle">
                    ${item.kind === "blog"
                        ? '<i class="fa-solid fa-rss"></i> Blog Post'
                        : `<i class="fa-solid fa-building-columns"></i> ${escapeHtml(item.venue)}`}
                </h4>
                ${renderStructuredSections("publications", item.sections)}
            </div>
        `;
    }

    function renderTalksTimelineItem(item, sectionId) {
        return `
            <div class="timeline-item" data-from="${escapeAttribute(item.from)}" data-to="${escapeAttribute(item.to)}">
                <div class="timeline-dot" style="display: none;"></div>
                <div class="timeline-date"><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatTimelineDate(item.from))}</div>
                <div class="timeline-content">
                    <a class="timeline-content-link" href="#" data-section-id="${escapeAttribute(sectionId)}">
                        <div class="timeline-content-details">
                            <div class="timeline-content-title">${escapeHtml(item.title)}</div>
                            <div class="timeline-content-venue">${escapeHtml(item.venue)}</div>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }

    function renderTalksContentSection(item, sectionId) {
        return `
            <div class="talks-content-section" id="${escapeAttribute(sectionId)}" style="display: none;">
                <h2 class="title talks-content-title">${escapeHtml(item.title)}</h2>
                <h4 class="subtitle talks-content-subtitle">
                    <i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatTimelineDate(item.date || item.from))}
                </h4>
                <h4 class="subtitle talks-content-subtitle">
                    <i class="fa-solid fa-microphone"></i> ${escapeHtml(item.venue)}
                </h4>
                ${renderStructuredSections("talks", item.sections, item, sectionId)}
            </div>
        `;
    }

    function renderServiceTimelineItem(item, sectionId) {
        return `
            <div class="timeline-item" data-from="${escapeAttribute(item.from)}" data-to="${escapeAttribute(item.to)}">
                <div class="timeline-dot" style="display: none;"></div>
                <div class="timeline-date"><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatTimelineDate(item.from))}</div>
                <div class="timeline-content">
                    <a class="timeline-content-link" href="#" data-section-id="${escapeAttribute(sectionId)}">
                        <div class="timeline-content-details">
                            <div class="timeline-content-title">${escapeHtml(item.title)}</div>
                            <div class="timeline-content-venue">${escapeHtml(item.venue)}</div>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }

    function renderServiceContentSection(item, sectionId) {
        const venueMarkup = item.venueUrl
            ? `<a href="${escapeAttribute(item.venueUrl)}" target="_blank">${escapeHtml(item.venue)}</a>`
            : escapeHtml(item.venue);

        return `
            <div class="service-content-section" id="${escapeAttribute(sectionId)}" style="display: none;">
                <h2 class="title service-content-title">${escapeHtml(item.title)}</h2>
                <h4 class="subtitle service-content-subtitle">
                    <i class="fa-solid fa-calendar-days"></i> ${escapeHtml(formatTimelineDate(item.date || item.from))}
                </h4>
                <h4 class="subtitle service-content-subtitle">
                    <i class="fa-solid fa-users"></i> ${venueMarkup}
                </h4>
                ${renderStructuredSections("service", item.sections, item, sectionId)}
            </div>
        `;
    }

    function formatPublicationTypeLabel(type) {
        if (type === "Research Papers") {
            return "Research Paper";
        }

        if (type === "Blogs") {
            return "Blog";
        }

        return type;
    }

    function generateFilters(config, items) {
        if (!config.filters) {
            return;
        }

        (config.filters.enumFilters || []).forEach((filter) => {
            const values = [];
            const seenValues = new Set();

            items.forEach((item) => {
                const value = item[filter.itemKey];

                if (value && !seenValues.has(value)) {
                    seenValues.add(value);
                    values.push(value);
                }
            });

            renderCheckboxList(filter.containerId, values, filter.itemKey);
        });

        if (config.filters.techContainerId) {
            renderTechFilters(config.filters.techContainerId, items);
        }
    }

    function renderCheckboxList(containerId, values, key) {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        container.innerHTML = values.map((value) => `
            <div class="field">
                <label class="checkbox">
                    <input type="checkbox" checked data-filter-key="${escapeAttribute(key)}" data-filter-value="${escapeAttribute(value)}" />
                    ${escapeHtml(value)}
                </label>
            </div>
        `).join("");
    }

    function renderTechFilters(containerId, items) {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        const techByCategory = new Map();

        items.forEach((item) => {
            Object.entries(item.tech || {}).forEach(([category, values]) => {
                if (!techByCategory.has(category)) {
                    techByCategory.set(category, []);
                }

                const categoryValues = techByCategory.get(category);

                values.forEach((value) => {
                    if (!categoryValues.includes(value)) {
                        categoryValues.push(value);
                    }
                });
            });
        });

        container.innerHTML = Array.from(techByCategory.entries()).map(([category, values]) => `
            <div class="field">
                <label class="label">${escapeHtml(category)}</label>
                ${values.map((value) => `
                    <div class="control">
                        <label class="checkbox">
                            <input type="checkbox" checked data-filter-key="technology" data-filter-value="${escapeAttribute(value)}" />
                            ${escapeHtml(value)}
                        </label>
                    </div>
                `).join("")}
            </div>
        `).join("");
    }

    async function loadModalData(config) {
        const items = await config.loadItems();
        const timeline = document.getElementById(config.timelineId);
        const panel = document.getElementById(config.contentPanelId);

        if (!timeline || !panel) {
            return items;
        }

        timeline.innerHTML = "";
        panel.innerHTML = "";

        items.forEach((item, index) => {
            const n = items.length - index;
            const sectionId = `${config.prefix}-section${n}`;
            timeline.insertAdjacentHTML("beforeend", config.renderTimelineItem(item, sectionId));
            panel.insertAdjacentHTML("beforeend", config.renderContentSection(item, sectionId));
        });

        generateFilters(config, items);
        return items;
    }

    async function initializeRenderedModals() {
        const renderedData = {};

        await Promise.all(modalConfigs.map(async (config) => {
            renderedData[config.prefix] = await loadModalData(config);
        }));

        window.renderedModalData = renderedData;

        if (window.Fancybox?.bind) {
            window.Fancybox.bind("[data-fancybox]", {});
        }

        if (window.MathJax?.typesetPromise) {
            await window.MathJax.typesetPromise();
        }

        return renderedData;
    }

    window.modalRenderReady = initializeRenderedModals().catch((error) => {
        console.error("Failed to render modal content", error);
        throw error;
    });
})();