function switchSection(id, el) {
    const hoverStyleToAdd = `
    border-radius: 20px;
    border-color: #1aff8c;
    border-style: solid;
    color: #1aff8c;
    background-color: #3d3e3b;
    `
    document.querySelectorAll('.we-content-section,.ed-content-section,.projects-content-section,.publications-content-section').forEach(c => c.style.display = 'none');
    document.querySelectorAll('div.timeline-dot').forEach(c => c.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    el.parentElement.parentElement.querySelector('.timeline-dot').style.display = 'block';
    el.parentElement.parentElement.classList.add('active');
    document.querySelectorAll('.timeline-content-link').forEach(c => c.style.cssText = "");
    el.style.cssText += hoverStyleToAdd
}

document.addEventListener('DOMContentLoaded', () => {

    // Mechanism for Modal (copy and pasted from Bulma)

    function openModal($el) {
        //$el.classList.add('animate__animated', 'animate__fadeInDown');
        $el.classList.add('is-active');

        if ($el.id === "work-experience-modal") {
            $el.querySelector('.timeline-content-link').click();

        }

        if ($el.id === "education-modal") {
            $el.querySelector('.timeline-content-link').click();

        }

        if ($el.id === "projects-modal") {
            $el.querySelector('.timeline-content-link').click();

        }

        if ($el.id === "publications-modal") {
            $el.querySelector('.timeline-content-link').click();
        }

        if ($el.id === "talks-modal") {
            $el.querySelector('.timeline-content-link').click();
        }
    }

    function closeModal($el) {
        //$el.classList.add('animate__animated', 'animate__fadeOutUp');
        $el.classList.remove('is-active');
    }

    function closeAllModals() {
        (document.querySelectorAll('.modal') || []).forEach(($modal) => {
            closeModal($modal);
        });
    }

    (document.querySelectorAll('.button') || []).forEach(($trigger) => {
        const modal = $trigger.dataset.target;
        const $target = document.getElementById(modal);

        $trigger.addEventListener('click', () => {
            openModal($target);
        });
    });

    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
        const $target = $close.closest('.modal');

        $close.addEventListener('click', () => {
            closeModal($target);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            closeAllModals();
        }
    });

    document.querySelectorAll('.tabs ul li').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            const section = target.split('-').pop();

            console.log(target.split('-'));
            // Remove active class from all tabs and hide all content
            document.querySelectorAll('.tabs ul li').forEach(t => {
                if (t.getAttribute('data-target').includes(section)) {
                    t.classList.remove('is-active');
                }
            });

            document.querySelectorAll('.tab-content').forEach(c => {
                if (c.id.includes(section)) {
                    c.style.display = 'none';
                }
            });

            // Set the clicked tab as active and show its content
            tab.classList.add('is-active');
            console.log(tab);
            document.getElementById(target).style.display = 'flex';
        });
    });

    //const timelineItems = document.querySelectorAll('.timeline-item');

    document.querySelector('#we-timeline-sector-filter').addEventListener('click', function () {
        openModal(document.querySelector('#we-timeline-sector-filter-modal'));
    });

    document.querySelectorAll('#we-timeline-sector-filter-modal input').forEach(checkbox => {
        checkbox.addEventListener('change', function (e) {
            const sector = e.target.closest('label').textContent.trim(); // Get the sector from data attribute
            document.querySelectorAll('#work-experience-modal .timeline-item').forEach(item => {
                if (item.dataset.sector == sector) {
                    item.style.display = e.target.checked ? "block" : "none";
                }
            });
        });
    });


    document.querySelector('#we-timeline-period-filter').addEventListener('click', function () {
        openModal(document.querySelector('#we-timeline-period-filter-modal'));
    });


    weCalendarFrom = bulmaCalendar.attach('#we-timeline-period-filter-from', {
        type: "date",
        displayMode: "dialog",
        startDate: '05/01/18',
        dateFormat: 'MM/dd/yy'
    });

    weCalendarTo = bulmaCalendar.attach('#we-timeline-period-filter-to', {
        type: "date",
        displayMode: "dialog",
        startDate: new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '/'),
        dateFormat: 'MM/dd/yy',
    });

    [weCalendarFrom[0], weCalendarTo[0]].forEach(d => {
        d.on('select', date => {
            const fromFilter = new Date(weCalendarFrom[0].value());
            const toFilter = new Date(weCalendarTo[0].value());
            document.querySelectorAll('#work-experience-modal .timeline-item').forEach(c => {
                const fromTimelineItem = new Date(c.dataset.from.slice(0, 3) + "01/" + c.dataset.from.slice(3));
                const toTimelineItem = new Date(c.dataset.to.slice(0, 3) + "01/" + c.dataset.to.slice(3));
                if (fromFilter <= fromTimelineItem && toFilter >= toTimelineItem) {
                    c.style.display = "block";
                }
                else {
                    c.style.display = "none";
                }

            });
        });
    });

    document.querySelector('#we-timeline-technology-filter').addEventListener('click', function () {
        openModal(document.querySelector('#we-timeline-technology-filter-modal'));
    });

    const timelineTechInputs = document.querySelectorAll('#we-timeline-technology-filter-modal input');

    timelineTechInputs.forEach(element => {
        element.addEventListener('change', e => {
            let selectedTech = [];
            timelineTechInputs.forEach(el => {
                if (el.checked) {
                    selectedTech.push(el.closest('label').textContent.trim()
                    );
                }
            })
            document.querySelectorAll('#work-experience-modal .timeline-item').forEach(c => {
                const technology = Object.values(JSON.parse(c.dataset.technology)).flat();
                const hasCommon = selectedTech.some(element => technology.includes(element));
                if (hasCommon) {
                    c.style.display = "block";
                }
                else {
                    c.style.display = "none";
                }

            });
        })
    });

    /**
     * Education modal related code
     */

    const projectItems = document.querySelectorAll(".ed-content-section-project ul li");

    projectItems.forEach(item => {
        item.addEventListener("click", function (e) {
            const projectDetails = item.nextElementSibling;

            // Check if it is the right div and toggle its display property
            if (projectDetails && projectDetails.classList.contains("ed-content-section-project-details")) {
                projectDetails.style.display = projectDetails.style.display === "none" ? "block" : "none";
            }
        });
    });

    /**
     * Projects modal related code
     */

    //const timelineItems = document.querySelectorAll('.timeline-item');

    document.querySelector('#projects-timeline-type-filter').addEventListener('click', function () {
        openModal(document.querySelector('#projects-timeline-type-filter-modal'));
    });


    document.querySelectorAll('#projects-timeline-type-filter-modal input').forEach(checkbox => {
        checkbox.addEventListener('change', function (e) {
            const type = e.target.closest('label').textContent.trim(); // Get the sector from data attribute
            document.querySelectorAll('#projects-modal .timeline-item').forEach(item => {
                if (item.dataset.sector == type) {
                    item.style.display = e.target.checked ? "block" : "none";
                }
            });
        });
    });



    document.querySelector('#projects-timeline-technology-filter').addEventListener('click', function () {
        openModal(document.querySelector('#projects-timeline-technology-filter-modal'));
    });

    const timelineProjectTechInputs = document.querySelectorAll('#projects-timeline-technology-filter-modal input');

    timelineProjectTechInputs.forEach(element => {
        element.addEventListener('change', e => {
            let selectedTech = [];
            timelineProjectTechInputs.forEach(el => {
                if (el.checked) {
                    selectedTech.push(el.closest('label').textContent.trim()
                    );
                }
            })
            document.querySelectorAll('#projects-modal .timeline-item').forEach(c => {
                const technology = Object.values(JSON.parse(c.dataset.technology)).flat();
                const hasCommon = selectedTech.some(element => technology.includes(element));
                if (hasCommon) {
                    c.style.display = "block";
                }
                else {
                    c.style.display = "none";
                }

            });
        })
    });

    /**
     * Publications modal related code
     */

    
    document.querySelector('#publications-timeline-type-filter').addEventListener('click', function () {
        openModal(document.querySelector('#publications-timeline-type-filter-modal'));
    });

    document.querySelectorAll('#publications-timeline-type-filter-modal input').forEach(checkbox => {
        checkbox.addEventListener('change', function (e) {
            const type = e.target.closest('label').textContent.trim();
            document.querySelectorAll('#publications-modal .timeline-item').forEach(item => {
                if (item.dataset.type == type) {
                    item.style.display = e.target.checked ? "block" : "none";
                }
            });
        });
    });

    /**
     * Talks modal related code
     */

    document.querySelector('#talks-timeline-period-filter').addEventListener('click', function () {
        openModal(document.querySelector('#talks-timeline-period-filter-modal'));
    });

    talksCalendarFrom = bulmaCalendar.attach('#talks-timeline-period-filter-from', {
        type: "date",
        displayMode: "dialog",
        startDate: '04/01/24',
        dateFormat: 'MM/dd/yy'
    });

    talksCalendarTo = bulmaCalendar.attach('#talks-timeline-period-filter-to', {
        type: "date",
        displayMode: "dialog",
        startDate: new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '/'),
        dateFormat: 'MM/dd/yy',
    });


    [talksCalendarFrom[0], talksCalendarTo[0]].forEach(d => {
        d.on('select', date => {
            const fromFilter = new Date(talksCalendarFrom[0].value());
            const toFilter = new Date(talksCalendarTo[0].value());
            document.querySelectorAll('#talks-modal .timeline-item').forEach(c => {
                const fromTimelineItem = new Date(c.dataset.from);
                const toTimelineItem = new Date(c.dataset.to);
                if (fromFilter <= fromTimelineItem && toFilter >= toTimelineItem) {
                    c.style.display = "block";
                }
                else {
                    c.style.display = "none";
                }

            });
        });
    });


    // Add animation to the landing page buttons
    const buttons = document.querySelectorAll('.landing-page-button');
    buttons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';
        setTimeout(() => {
            button.style.transition = 'all 0.5s ease';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 100 * index);
    });
    
});



Fancybox.bind("[data-fancybox]", {
    // Your custom options
});
