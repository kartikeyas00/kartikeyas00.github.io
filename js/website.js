function switchSection(id, el) {
    const targetSection = document.getElementById(id);

    if (!targetSection || !el) {
        return;
    }

    const hoverStyleToAdd = `
    border-radius: 20px;
    border-color: #1aff8c;
    border-style: solid;
    color: #1aff8c;
    background-color: #3d3e3b;
    `;

    document.querySelectorAll(".we-content-section,.ed-content-section,.projects-content-section,.publications-content-section,.talks-content-section,.service-content-section").forEach((section) => {
        section.style.display = "none";
    });

    document.querySelectorAll("div.timeline-dot").forEach((dot) => {
        dot.style.display = "none";
    });

    document.querySelectorAll(".timeline-item.active").forEach((item) => {
        item.classList.remove("active");
    });

    document.querySelectorAll(".timeline-content-link").forEach((link) => {
        link.style.cssText = "";
    });

    targetSection.style.display = "block";

    const timelineItem = el.closest(".timeline-item");
    timelineItem?.querySelector(".timeline-dot")?.style.setProperty("display", "block");
    timelineItem?.classList.add("active");
    el.style.cssText += hoverStyleToAdd;
}

document.addEventListener("DOMContentLoaded", () => {
    const modalRenderReady = window.modalRenderReady || Promise.resolve();
    const isMobile = () => window.innerWidth <= 768;
    const expandedState = new Map();
    let currentScrollPosition = 0;
    let weCalendarFrom;
    let weCalendarTo;
    let talksCalendarFrom;
    let talksCalendarTo;
    let serviceCalendarFrom;
    let serviceCalendarTo;

    const removeChildrenConfig = {
        talks: 3,
        projects: 2,
        we: 4,
        ed: 4,
        publications: 2,
        service: 3
    };

    function parseCalendarDate(value) {
        if (!value) {
            return null;
        }

        const [month, day, year] = value.split("/").map(Number);

        if ([month, day, year].some(Number.isNaN)) {
            return null;
        }

        const fullYear = year < 100 ? 2000 + year : year;
        return new Date(fullYear, month - 1, day);
    }

    function parseMonthYearDate(value, fallbackToNow = false) {
        if (!value) {
            return fallbackToNow ? new Date() : null;
        }

        const [month, year] = value.split("/").map(Number);

        if ([month, year].some(Number.isNaN)) {
            return fallbackToNow ? new Date() : null;
        }

        return new Date(year, month - 1, 1);
    }

    function parseLocalIsoDate(value, fallbackToNow = false) {
        if (!value) {
            return fallbackToNow ? new Date() : null;
        }

        const [year, month, day] = value.split("-").map(Number);

        if ([year, month, day].some(Number.isNaN)) {
            return fallbackToNow ? new Date() : null;
        }

        return new Date(year, month - 1, day);
    }

    function getFirstVisibleTimelineLink(modal) {
        const visibleItem = Array.from(modal.querySelectorAll(".timeline-item")).find((item) => {
            return item.style.display !== "none";
        });

        return visibleItem?.querySelector(".timeline-content-link") || null;
    }

    function clearModalSelection(modal) {
        modal.querySelectorAll(".timeline-item.active").forEach((item) => {
            item.classList.remove("active");
        });

        modal.querySelectorAll(".timeline-content-link").forEach((link) => {
            link.style.cssText = "";
        });

        modal.querySelectorAll(".timeline-dot").forEach((dot) => {
            dot.style.display = "none";
        });

        modal.querySelectorAll(".we-content-section,.ed-content-section,.projects-content-section,.publications-content-section,.talks-content-section,.service-content-section").forEach((section) => {
            section.style.display = "none";
        });
    }

    function collapseMobileSection(section) {
        section.style.height = `${section.scrollHeight}px`;
        section.offsetHeight;
        section.style.height = "0";
        section.style.opacity = "0";
        section.style.padding = "0 1rem";

        setTimeout(() => {
            section.remove();
        }, 300);
    }

    function cleanupMobileContent() {
        document.querySelectorAll(".mobile-content-section").forEach((section) => {
            section.remove();
        });

        expandedState.clear();

        document.querySelectorAll(".timeline-content-link.mobile-active").forEach((link) => {
            link.classList.remove("mobile-active");
        });
    }

    function findTimelineLinkBySectionId(modal, sectionId) {
        if (!modal || !sectionId) {
            return null;
        }

        return Array.from(modal.querySelectorAll(".timeline-content-link")).find((link) => {
            return link.dataset.sectionId === sectionId;
        }) || null;
    }

    function getRenderedSectionId(prefix, title, venue) {
        const items = window.renderedModalData?.[prefix];

        if (!Array.isArray(items) || !title) {
            return null;
        }

        const index = items.findIndex((item) => {
            const sameTitle = item.title === title;
            const sameVenue = venue ? item.venue === venue : true;
            return sameTitle && sameVenue;
        });

        return index === -1 ? null : `${prefix}-section${items.length - index}`;
    }

    async function openModalTrigger(trigger) {
        if (!trigger) {
            return;
        }

        await modalRenderReady;

        const targetModal = document.getElementById(trigger.dataset.target);

        if (!targetModal) {
            return;
        }

        openModal(targetModal);

        const sectionId = trigger.dataset.sectionId || getRenderedSectionId(
            trigger.dataset.modalPrefix,
            trigger.dataset.itemTitle,
            trigger.dataset.itemVenue
        );

        if (!sectionId) {
            return;
        }

        const timelineLink = findTimelineLinkBySectionId(targetModal, sectionId);

        if (!timelineLink) {
            return;
        }

        if (isMobile()) {
            handleMobileTimelineClick(timelineLink);
            timelineLink.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        timelineLink.click();
        timelineLink.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function openModal(modal) {
        if (!modal) {
            return;
        }

        modal.classList.add("is-active");

        if (isMobile()) {
            return;
        }

        getFirstVisibleTimelineLink(modal)?.click();
    }

    function closeModalElement(modal) {
        if (!modal) {
            return;
        }

        modal.classList.remove("is-active");
        cleanupMobileContent();
    }

    function closeAllModals() {
        document.querySelectorAll(".modal").forEach((modal) => {
            closeModalElement(modal);
        });
    }

    function restoreScrollPosition() {
        if (isMobile()) {
            window.scrollTo(0, currentScrollPosition);
        }
    }

    function debounce(func, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(null, args), delay);
        };
    }

    function getCheckedValues(containerSelector) {
        const inputs = Array.from(document.querySelectorAll(`${containerSelector} input[type="checkbox"]`));
        return {
            selected: inputs.filter((input) => input.checked).map((input) => input.dataset.filterValue || ""),
            total: inputs.length
        };
    }

    function matchesSelection(value, state) {
        if (state.total === 0) {
            return true;
        }

        if (state.selected.length === 0) {
            return false;
        }

        return state.selected.includes(value || "");
    }

    function matchesTech(item, state) {
        if (state.total === 0) {
            return true;
        }

        if (state.selected.length === 0) {
            return false;
        }

        const technology = Object.values(JSON.parse(item.dataset.technology || "{}")).flat();
        return state.selected.some((value) => technology.includes(value));
    }

    function matchesDateRange(startDate, endDate, fromDate, toDate) {
        if (!startDate && !endDate) {
            return true;
        }

        if (!fromDate || !toDate) {
            return false;
        }

        if (startDate && toDate < startDate) {
            return false;
        }

        if (endDate && fromDate > endDate) {
            return false;
        }

        return true;
    }

    function syncVisibleSelection(modalId) {
        const modal = document.getElementById(modalId);

        if (!modal || !modal.classList.contains("is-active") || isMobile()) {
            return;
        }

        const activeItem = modal.querySelector(".timeline-item.active");

        if (activeItem && activeItem.style.display !== "none") {
            return;
        }

        const firstVisibleLink = getFirstVisibleTimelineLink(modal);

        if (!firstVisibleLink) {
            clearModalSelection(modal);
            return;
        }

        firstVisibleLink.click();
    }

    function applyWorkExperienceFilters() {
        const sectorState = getCheckedValues("#we-timeline-sector-filter-options");
        const technologyState = getCheckedValues("#we-timeline-technology-filter-options");
        const startDate = parseCalendarDate(weCalendarFrom?.value());
        const endDate = parseCalendarDate(weCalendarTo?.value());

        document.querySelectorAll("#work-experience-modal .timeline-item").forEach((item) => {
            const fromDate = parseMonthYearDate(item.dataset.from);
            const toDate = parseMonthYearDate(item.dataset.to, true);
            const isVisible = matchesSelection(item.dataset.sector, sectorState)
                && matchesTech(item, technologyState)
                && matchesDateRange(startDate, endDate, fromDate, toDate);

            item.style.display = isVisible ? "block" : "none";
        });

        syncVisibleSelection("work-experience-modal");
    }

    function applyProjectsFilters() {
        const typeState = getCheckedValues("#projects-timeline-type-filter-options");
        const technologyState = getCheckedValues("#projects-timeline-technology-filter-options");

        document.querySelectorAll("#projects-modal .timeline-item").forEach((item) => {
            const itemType = item.dataset.type || item.dataset.sector || "";
            const isVisible = matchesSelection(itemType, typeState)
                && matchesTech(item, technologyState);

            item.style.display = isVisible ? "block" : "none";
        });

        syncVisibleSelection("projects-modal");
    }

    function applyPublicationsFilters() {
        const typeState = getCheckedValues("#publications-timeline-type-filter-options");

        document.querySelectorAll("#publications-modal .timeline-item").forEach((item) => {
            const isVisible = matchesSelection(item.dataset.type, typeState);
            item.style.display = isVisible ? "block" : "none";
        });

        syncVisibleSelection("publications-modal");
    }

    function applyTalksFilters() {
        const startDate = parseCalendarDate(talksCalendarFrom?.value());
        const endDate = parseCalendarDate(talksCalendarTo?.value());

        document.querySelectorAll("#talks-modal .timeline-item").forEach((item) => {
            const fromDate = parseLocalIsoDate(item.dataset.from);
            const toDate = parseLocalIsoDate(item.dataset.to, true);
            const isVisible = matchesDateRange(startDate, endDate, fromDate, toDate);
            item.style.display = isVisible ? "block" : "none";
        });

        syncVisibleSelection("talks-modal");
    }

    function applyServiceFilters() {
        const startDate = parseCalendarDate(serviceCalendarFrom?.value());
        const endDate = parseCalendarDate(serviceCalendarTo?.value());

        document.querySelectorAll("#service-modal .timeline-item").forEach((item) => {
            const fromDate = parseLocalIsoDate(item.dataset.from);
            const toDate = parseLocalIsoDate(item.dataset.to, true);
            const isVisible = matchesDateRange(startDate, endDate, fromDate, toDate);
            item.style.display = isVisible ? "block" : "none";
        });

        syncVisibleSelection("service-modal");
    }

    function handleMobileTimelineClick(link) {
        const sectionId = link.dataset.sectionId;

        if (!sectionId) {
            return;
        }

        const originalContent = document.getElementById(sectionId);

        if (!originalContent) {
            return;
        }

        const existingContent = link.parentElement.nextElementSibling;

        if (existingContent?.classList.contains("mobile-content-section")) {
            collapseMobileSection(existingContent);

            if (expandedState.get(link)) {
                expandedState.set(link, false);
                link.classList.remove("mobile-active");
                return;
            }
        }

        if (expandedState.get(link)) {
            expandedState.set(link, false);
            link.classList.remove("mobile-active");
            return;
        }

        document.querySelectorAll(".timeline-content-link.mobile-active").forEach((activeLink) => {
            const expandedContent = activeLink.parentElement.nextElementSibling;

            if (expandedContent?.classList.contains("mobile-content-section")) {
                collapseMobileSection(expandedContent);
            }

            expandedState.set(activeLink, false);
            activeLink.classList.remove("mobile-active");
        });

        const clonedContent = document.createElement("div");
        clonedContent.classList.add("mobile-content-section");

        const prefix = sectionId.split("-")[0];
        const numberChildrenRemove = removeChildrenConfig[prefix] || 0;
        const contentWithoutHeader = Array.from(originalContent.children)
            .slice(numberChildrenRemove)
            .map((element) => element.cloneNode(true));

        contentWithoutHeader.forEach((element) => {
            clonedContent.appendChild(element);
        });

        clonedContent.style.height = "0";
        link.parentElement.insertAdjacentElement("afterend", clonedContent);

        requestAnimationFrame(() => {
            const height = clonedContent.scrollHeight;
            clonedContent.style.height = `${height}px`;
            clonedContent.style.opacity = "1";
            clonedContent.style.padding = "1rem";

            setTimeout(() => {
                clonedContent.style.height = "auto";
            }, 300);
        });

        expandedState.set(link, true);
        link.classList.add("mobile-active");
    }

    function setupCalendars() {
        [weCalendarFrom] = bulmaCalendar.attach("#we-timeline-period-filter-from", {
            type: "date",
            displayMode: "dialog",
            startDate: "05/01/18",
            dateFormat: "MM/dd/yy"
        });

        [weCalendarTo] = bulmaCalendar.attach("#we-timeline-period-filter-to", {
            type: "date",
            displayMode: "dialog",
            startDate: new Date().toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
            dateFormat: "MM/dd/yy"
        });

        [talksCalendarFrom] = bulmaCalendar.attach("#talks-timeline-period-filter-from", {
            type: "date",
            displayMode: "dialog",
            startDate: "04/01/24",
            dateFormat: "MM/dd/yy"
        });

        [talksCalendarTo] = bulmaCalendar.attach("#talks-timeline-period-filter-to", {
            type: "date",
            displayMode: "dialog",
            startDate: new Date().toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
            dateFormat: "MM/dd/yy"
        });

        [serviceCalendarFrom] = bulmaCalendar.attach("#service-timeline-period-filter-from", {
            type: "date",
            displayMode: "dialog",
            startDate: "11/15/24",
            dateFormat: "MM/dd/yy"
        });

        [serviceCalendarTo] = bulmaCalendar.attach("#service-timeline-period-filter-to", {
            type: "date",
            displayMode: "dialog",
            startDate: new Date().toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
            dateFormat: "MM/dd/yy"
        });

        [weCalendarFrom, weCalendarTo].forEach((calendar) => {
            calendar.on("select", applyWorkExperienceFilters);
        });

        [talksCalendarFrom, talksCalendarTo].forEach((calendar) => {
            calendar.on("select", applyTalksFilters);
        });

        [serviceCalendarFrom, serviceCalendarTo].forEach((calendar) => {
            calendar.on("select", applyServiceFilters);
        });
    }

    window.closeModal = function () {
        closeAllModals();
    };

    document.querySelectorAll(".portfolio-modal-trigger").forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            openModalTrigger(trigger);
        });
    });

    document.querySelectorAll(".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button").forEach((closeTrigger) => {
        const targetModal = closeTrigger.closest(".modal");

        closeTrigger.addEventListener("click", () => {
            closeModalElement(targetModal);
        });
    });

    [
        ["we-timeline-sector-filter", "we-timeline-sector-filter-modal"],
        ["we-timeline-period-filter", "we-timeline-period-filter-modal"],
        ["we-timeline-technology-filter", "we-timeline-technology-filter-modal"],
        ["projects-timeline-type-filter", "projects-timeline-type-filter-modal"],
        ["projects-timeline-technology-filter", "projects-timeline-technology-filter-modal"],
        ["publications-timeline-type-filter", "publications-timeline-type-filter-modal"],
        ["talks-timeline-period-filter", "talks-timeline-period-filter-modal"],
        ["service-timeline-period-filter", "service-timeline-period-filter-modal"]
    ].forEach(([buttonId, modalId]) => {
        const button = document.getElementById(buttonId);
        const modal = document.getElementById(modalId);

        button?.addEventListener("click", () => {
            openModal(modal);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAllModals();
        }
    });

    document.addEventListener("click", (event) => {
        const tab = event.target.closest(".tabs ul li");

        if (tab) {
            const target = tab.getAttribute("data-target");
            const section = target.split("-").pop();

            document.querySelectorAll(".tabs ul li").forEach((candidate) => {
                if (candidate.getAttribute("data-target")?.includes(section)) {
                    candidate.classList.remove("is-active");
                }
            });

            document.querySelectorAll(".tab-content").forEach((content) => {
                if (content.id.includes(section)) {
                    content.style.display = "none";
                }
            });

            tab.classList.add("is-active");
            document.getElementById(target).style.display = "flex";
            return;
        }

        const educationProject = event.target.closest(".ed-content-section-project ul li");

        if (educationProject) {
            const details = educationProject.nextElementSibling;

            if (details?.classList.contains("ed-content-section-project-details")) {
                details.style.display = details.style.display === "none" ? "block" : "none";
            }

            return;
        }

        const timelineLink = event.target.closest(".timeline-content-link");

        if (!timelineLink) {
            return;
        }

        event.preventDefault();

        if (isMobile()) {
            handleMobileTimelineClick(timelineLink);
            return;
        }

        switchSection(timelineLink.dataset.sectionId, timelineLink);
    });

    document.addEventListener("change", (event) => {
        const target = event.target;

        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        if (target.closest("#we-timeline-sector-filter-options") || target.closest("#we-timeline-technology-filter-options")) {
            applyWorkExperienceFilters();
            return;
        }

        if (target.closest("#projects-timeline-type-filter-options") || target.closest("#projects-timeline-technology-filter-options")) {
            applyProjectsFilters();
            return;
        }

        if (target.closest("#publications-timeline-type-filter-options")) {
            applyPublicationsFilters();
        }
    });

    const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.contentRect.width > 768) {
                cleanupMobileContent();
            }
        });
    });

    resizeObserver.observe(document.body);

    window.addEventListener("resize", debounce(() => {
        if (!isMobile()) {
            cleanupMobileContent();
            return;
        }

        restoreScrollPosition();
    }, 200));

    window.addEventListener("scroll", () => {
        if (isMobile()) {
            currentScrollPosition = window.scrollY;
        }
    });

    modalRenderReady.then(() => {
        setupCalendars();
        applyWorkExperienceFilters();
        applyProjectsFilters();
        applyPublicationsFilters();
        applyTalksFilters();
        applyServiceFilters();
    }).catch((error) => {
        console.error("Failed to initialize dynamic site behaviors", error);
    });
});