document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('.f-pill');
  const scroll = document.getElementById('idx-scroll');
  const highlightList = document.getElementById('hl-list');
  const detailModal = document.getElementById('landing-detail-modal');
  const detailContent = document.getElementById('landing-detail-content');
  const detailDate = document.getElementById('landing-detail-date');
  const detailKind = document.getElementById('landing-detail-kind');
  const detailClose = document.getElementById('landing-detail-close');
  const archiveEntriesById = new Map();
  const sourcePanelIdByPrefix = {
    we: 'we-content-panel',
    ed: 'ed-content-panel',
    projects: 'projects-content-panel',
    publications: 'publications-content-panel',
    talks: 'talks-content-panel',
    service: 'service-content-panel'
  };
  const highlightKeys = [
    'talks|Adversarial Techniques for Bypassing Graph Neural Network-Based Network Defense|SAINTCON 2025',
    'publications|Graph Neural Network-Based DDoS Protection for Data Center Infrastructure|43rd Annual Pacific Northwest Software Quality Conference',
    'talks|GPT as Ally: Improving Cybersecurity Workflows with GPT and Embedding APIs|BSides Austin 2024'
  ];
  const titleOverrides = {
    'talks|Adversarial Techniques for Bypassing Graph Neural Network-Based Network Defense|SAINTCON 2025': 'Adversarial Techniques for Bypassing GNN-Based Network Defense',
    'publications|Graph Neural Network-Based DDoS Protection for Data Center Infrastructure|43rd Annual Pacific Northwest Software Quality Conference': 'GNN-Based DDoS Protection for Data Center Infrastructure',
    'talks|Graph Neural Network-Based DDoS Protection for Data Center Infrastructure|Pacific Northwest Software Quality Conference 2025': 'GNN-Based DDoS Protection for Data Center Infrastructure',
    'talks|Graphing the Insider: Innovative Applications of GNNs in Insider Threat Detection|BSides Portland 2024': 'Graphing the Insider: GNNs in Insider Threat Detection',
    'talks|Utilizing Graph Neural Networks for Robust DDoS Attack Detection in Network Security|Oregon Cyber Resilience Summit 2024': 'GNNs for Robust DDoS Attack Detection in Network Security',
    'talks|Utilizing Graph Neural Networks for Robust DDoS Attack Detection in Network Security|BSides Cache 2024': 'GNNs for Robust DDoS Attack Detection in Network Security',
    'projects|Enhancing Schelling’s Segregation Model: A Distributed Geo-spatial Approach|': 'Distributed Geo-spatial Schelling Segregation Model',
    'projects|Cowin Automate: Automated Vaccination Availability Alerts Using Cowin API|': 'Cowin Automate — Vaccination Availability Alerts',
    'ed|M.S. in Computer Science|University of Oregon': 'M.S. Computer Science',
    'ed|B.A. in Computer Science, Accounting|Goshen College': 'B.A. Computer Science & Accounting',
    'service|Research Paper Reviewer|Pacific Northwest Software Quality Conference 2025': 'Research Paper Reviewer'
  };
  const summaryOverrides = {
    'talks|Adversarial Techniques for Bypassing Graph Neural Network-Based Network Defense|SAINTCON 2025': 'SaintCon 2025. Three adversarial topology attacks that degrade graph-based IDS performance.',
    'publications|Graph Neural Network-Based DDoS Protection for Data Center Infrastructure|43rd Annual Pacific Northwest Software Quality Conference': 'PNSQC 2025. Graph U-Net deployment for enterprise telemetry with precision above 98%.',
    'talks|GPT as Ally: Improving Cybersecurity Workflows with GPT and Embedding APIs|BSides Austin 2024': 'BSides Austin 2024. Semantic matching, anomaly detection, and threat correlation with GPT and embeddings.',
    'talks|Graph Neural Network-Based DDoS Protection for Data Center Infrastructure|Pacific Northwest Software Quality Conference 2025': 'PNSQC 2025. Three-stage deployment pipeline for graph-based DDoS detection in data centers.',
    'talks|Graphing the Insider: Innovative Applications of GNNs in Insider Threat Detection|BSides Portland 2024': 'BSides Portland 2024. GNN architectures for behavioral insider threat detection.',
    'talks|Utilizing Graph Neural Networks for Robust DDoS Attack Detection in Network Security|Oregon Cyber Resilience Summit 2024': 'Oregon Cyber Resilience Summit 2024. GNN detection strategies versus traditional ML baselines.',
    'talks|Utilizing Graph Neural Networks for Robust DDoS Attack Detection in Network Security|BSides Cache 2024': 'BSides Cache 2024. GNN model comparison against conventional detection methods.',
    'talks|Graph Neural Networks: Revolutionizing DDoS Attack Detection|BSides Seattle 2024': 'BSides Seattle 2024. Structural graph learning as an alternative to signature-based DDoS detection.',
    'publications|Graph Neural Networks for Enhanced DDoS Attack Detection|': 'Blog post on graph-based DDoS detection using GNN architectures.',
    'service|Research Paper Reviewer|Pacific Northwest Software Quality Conference 2025': 'Reviewed two full research papers for technical rigor, methodology, and contribution.',
    'service|CFP Reviewer|BSides SLC 2026': 'Reviewed 125 submissions for technical quality, clarity, and program fit.',
    'service|CFP Reviewer|BSides Cache 2025': 'Reviewed 48 CFP submissions for technical quality, originality, and audience relevance.',
    'service|CFP Reviewer|BSides SLC 2025': 'Reviewed 118 submissions for technical strength, clarity, and originality.',
    'service|CFP Reviewer|BSides Red Rocks 2024': 'Reviewed 37 submissions for technical quality, originality, and conference program balance.',
    'we|Senior Associate Information Security Engineer|Equinix': 'Threat analysis, reporting systems, and graph-based detection research.',
    'ed|M.S. in Computer Science|University of Oregon': 'Security, machine learning, distributed systems, research, and teaching roles.',
    'ed|B.A. in Computer Science, Accounting|Goshen College': 'Computer science and accounting thesis work, full-tuition scholarship, and NAIA tennis.',
    'projects|Enhancing Schelling’s Segregation Model: A Distributed Geo-spatial Approach|': '17× speedup via distributed partitioning on geospatial simulations with millions of agents.',
    'projects|Cowin Automate: Automated Vaccination Availability Alerts Using Cowin API|': 'Python workflow polling the CoWin API and alerting users about vaccination slot availability.'
  };
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const escapeAttribute = (value) => escapeHtml(value);

  const getActiveFilter = () => document.querySelector('.f-pill.is-active')?.dataset.filter || 'all';

  const getEntryKey = (prefix, item) => {
    const detail = item.venue || item.company || item.institution || '';
    const title = item.title || item.role || item.degree || '';
    return `${prefix}|${title}|${detail}`;
  };

  const flattenRichText = (value) => {
    if (Array.isArray(value)) {
      return value.map(flattenRichText).join('');
    }

    if (value && typeof value === 'object') {
      return value.text || '';
    }

    return String(value || '');
  };

  const findFirstParagraph = (item) => {
    const paragraphSection = (item.sections || []).find((section) => section.type === 'paragraphs' && Array.isArray(section.paragraphs) && section.paragraphs.length);

    if (!paragraphSection) {
      return '';
    }

    return flattenRichText(paragraphSection.paragraphs[0]).replace(/\s+/g, ' ').trim();
  };

  const truncateText = (value, maxLength = 112) => {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();

    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
  };

  const joinWithAnd = (values) => {
    const items = values.filter(Boolean);

    if (!items.length) {
      return '';
    }

    if (items.length === 1) {
      return items[0];
    }

    if (items.length === 2) {
      return `${items[0]} and ${items[1]}`;
    }

    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  };

  const parseEducationDegree = (degree) => {
    const normalized = String(degree || '').trim();
    const degreeMap = {
      'M.S.': 'Master of Science',
      'B.A.': 'Bachelor of Arts',
      'B.S.': 'Bachelor of Science',
      'M.A.': 'Master of Arts'
    };
    const abbreviated = normalized.match(/^(M\.S\.|B\.A\.|B\.S\.|M\.A\.)\s+in\s+(.+)$/i);

    if (abbreviated) {
      return {
        fullDegree: degreeMap[abbreviated[1]] || normalized,
        majors: joinWithAnd(abbreviated[2].split(/\s*,\s*/))
      };
    }

    const expanded = normalized.match(/^(.+?)\s+in\s+(.+)$/i);

    if (expanded) {
      return {
        fullDegree: expanded[1],
        majors: joinWithAnd(expanded[2].split(/\s*,\s*/))
      };
    }

    return {
      fullDegree: normalized,
      majors: ''
    };
  };

  const parseDateValue = (value) => {
    if (!value) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(`${value}T00:00:00`);
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [month, day, year] = value.split('/').map(Number);
      return new Date(year, month - 1, day);
    }

    return Number.isNaN(Date.parse(value)) ? null : new Date(value);
  };

  const formatMonthYear = (value) => {
    if (!value) {
      return '';
    }

    if (/^\d{2}\/\d{4}$/.test(value)) {
      const [month, year] = value.split('/');
      return `${year}.${month}`;
    }

    const parsed = parseDateValue(value);

    if (!parsed) {
      return value;
    }

    const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
    return `${parsed.getFullYear()}.${month}`;
  };

  const formatSlashMonthYear = (value) => {
    if (!value) {
      return '';
    }

    if (/^\d{2}\/\d{4}$/.test(value)) {
      return value;
    }

    const parsed = parseDateValue(value);

    if (!parsed) {
      return value;
    }

    const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
    return `${month}/${parsed.getFullYear()}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${year}.${month}.${day}`;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [month, day, year] = value.split('/');
      return `${year}.${month}.${day}`;
    }

    const parsed = parseDateValue(value);

    if (!parsed) {
      return value;
    }

    const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
    const day = `${parsed.getDate()}`.padStart(2, '0');
    return `${parsed.getFullYear()}.${month}.${day}`;
  };

  const formatMonthRange = (from, to, presentLabel = 'now') => {
    const start = formatMonthYear(from);
    const end = to ? formatMonthYear(to) : presentLabel;

    if (!start) {
      return end === presentLabel ? '' : end;
    }

    return `${start}–${end}`;
  };

  const formatSlashMonthRange = (from, to) => {
    const start = formatSlashMonthYear(from);
    const end = to ? formatSlashMonthYear(to) : 'Present';

    if (!start) {
      return end === 'Present' ? '' : end;
    }

    return `${start} - ${end}`;
  };

  const formatEducationDate = (item) => {
    if (item.from || item.to) {
      const start = parseDateValue(item.from);
      const end = parseDateValue(item.to || item.from);

      if (start && end) {
        return `${start.getFullYear()}–${end.getFullYear()}`;
      }
    }

    const matches = String(item.period || '').match(/(\d{2})\/(\d{4})/g) || [];

    if (matches.length < 2) {
      return item.period || '';
    }

    const startYear = matches[0].slice(-4);
    const endYear = matches[1].slice(-4);
    return `${startYear}–${endYear}`;
  };

  const getTimestamp = (item) => {
    const candidate = item.from || item.date || item.period?.split(' - ')[0] || item.from;
    const parsed = parseDateValue(candidate) || parseDateValue(item.date);
    return parsed?.getTime() || 0;
  };

  const getDisplayTitle = (prefix, item) => {
    const entryKey = getEntryKey(prefix, item);
    const baseTitle = titleOverrides[entryKey] || item.title || item.role || item.degree || '';

    if (prefix === 'we') {
      return `${baseTitle} @ ${item.company}`;
    }

    if (prefix === 'ed') {
      return `${baseTitle} @ ${item.institution}`;
    }

    if (prefix === 'service') {
      return `${baseTitle} @ ${item.venue}`;
    }

    return baseTitle;
  };

  const getSubtitle = (prefix, item) => {
    const entryKey = getEntryKey(prefix, item);

    if (summaryOverrides[entryKey]) {
      return summaryOverrides[entryKey];
    }

    if (prefix === 'we') {
      return truncateText(findFirstParagraph(item) || item.location || item.sector, 108);
    }

    if (prefix === 'ed') {
      return truncateText(item.location || findFirstParagraph(item), 108);
    }

    if (prefix === 'service') {
      return truncateText(findFirstParagraph(item) || item.venue, 108);
    }

    if (prefix === 'talks') {
      return truncateText(`${item.venue}. ${findFirstParagraph(item)}`, 112);
    }

    if (prefix === 'publications') {
      return truncateText(findFirstParagraph(item) || item.venue || '', 112);
    }

    if (prefix === 'projects') {
      return truncateText(findFirstParagraph(item), 112);
    }

    return '';
  };

  const buildEntry = (prefix, item, index, items) => {
    const sourceSectionId = `${prefix}-section${items.length - index}`;
    const entryKey = getEntryKey(prefix, item);
    const filterKindByPrefix = {
      we: 'work',
      ed: 'education',
      projects: 'project',
      publications: 'paper',
      talks: 'talk',
      service: 'service'
    };
    const labelByPrefix = {
      we: 'WORK',
      ed: 'EDUCATION',
      projects: 'PROJECT',
      publications: item.kind === 'blog' ? 'WRITING' : 'PAPER',
      talks: 'TALK',
      service: 'SERVICE'
    };
    const dateByPrefix = {
      we: formatMonthRange(item.from, item.to),
      ed: formatEducationDate(item),
      projects: formatMonthYear(item.date) || 'Undated',
      publications: item.kind === 'blog' ? formatDate(item.date) : formatDate(item.date),
      talks: formatDate(item.from || item.date),
      service: formatDate(item.from || item.date)
    };

    return {
      id: sourceSectionId,
      prefix,
      key: entryKey,
      filterKind: filterKindByPrefix[prefix],
      label: labelByPrefix[prefix],
      title: getDisplayTitle(prefix, item),
      subtitle: getSubtitle(prefix, item),
      dateText: prefix === 'projects' && !dateByPrefix[prefix] ? '' : dateByPrefix[prefix],
      timestamp: getTimestamp(item),
      item,
      sourcePanelId: sourcePanelIdByPrefix[prefix]
    };
  };

  const buildArchiveEntries = (renderedData) => {
    const prefixes = ['service', 'talks', 'publications', 'we', 'projects', 'ed'];
    const entries = [];

    prefixes.forEach((prefix) => {
      const items = Array.isArray(renderedData[prefix]) ? renderedData[prefix] : [];
      items.forEach((item, index) => {
        entries.push(buildEntry(prefix, item, index, items));
      });
    });

    entries.sort((left, right) => right.timestamp - left.timestamp);
    return entries;
  };

  const renderArchiveMessage = (container, message) => {
    if (!container) {
      return;
    }

    container.innerHTML = `<p class="archive-empty-state">${escapeHtml(message)}</p>`;
  };

  const renderHighlights = (entries) => {
    if (!highlightList) {
      return;
    }

    const markup = highlightKeys.map((entryKey) => entries.find((entry) => entry.key === entryKey))
      .filter(Boolean)
      .map((entry) => `
        <button class="hl-row" type="button" data-entry-id="${escapeAttribute(entry.id)}" role="listitem">
          <span class="hl-date">${escapeHtml(entry.dateText)}</span>
          <span class="hl-kind">${escapeHtml(entry.label)}</span>
          <span class="hl-body">
            <span class="hl-title">${escapeHtml(entry.title)}</span>
            <span class="hl-sub">${escapeHtml(entry.subtitle)}</span>
          </span>
          <span class="hl-action" aria-hidden="true">Open ↗</span>
        </button>
      `).join('');

    highlightList.innerHTML = markup;
  };

  const renderIndex = (entries) => {
    if (!scroll) {
      return;
    }

    scroll.innerHTML = entries.map((entry) => {
      return `
        <button class="idx-row" type="button" data-kind="${escapeAttribute(entry.filterKind)}" data-entry-id="${escapeAttribute(entry.id)}">
          <span class="idx-date">${escapeHtml(entry.dateText)}</span>
          <span class="idx-kind">${escapeHtml(entry.label)}</span>
          <span class="idx-body">
            <span class="idx-title">${escapeHtml(entry.title)}</span>
            ${entry.subtitle ? `<span class="idx-sub">${escapeHtml(entry.subtitle)}</span>` : ''}
          </span>
          <span class="idx-action">Open ↗</span>
        </button>
      `;
    }).join('');
  };

  const applyFilter = (filter) => {
    document.querySelectorAll('.idx-row').forEach((row) => {
      const show = filter === 'all' || row.dataset.kind === filter;
      row.classList.toggle('is-hidden', !show);
    });

    if (scroll) {
      scroll.scrollTop = 0;
    }
  };

  const uniquifyClone = (root, entryId) => {
    const idMap = new Map();

    root.querySelectorAll('[id]').forEach((element) => {
      const originalId = element.id;
      const uniqueId = `${originalId}-${entryId}`;
      idMap.set(originalId, uniqueId);
      element.id = uniqueId;
    });

    root.querySelectorAll('[data-target]').forEach((element) => {
      const currentTarget = element.getAttribute('data-target');

      if (idMap.has(currentTarget)) {
        element.setAttribute('data-target', idMap.get(currentTarget));
      }
    });

    root.querySelectorAll('[data-fancybox]').forEach((element) => {
      const currentGroup = element.getAttribute('data-fancybox') || 'gallery';
      element.setAttribute('data-fancybox', `${currentGroup}-${entryId}`);
    });
  };

  const unwrapHighlights = (root) => {
    root.querySelectorAll('.highlight').forEach((node) => {
      node.replaceWith(document.createTextNode(node.textContent || ''));
    });
  };

  const resetDetailTabs = (root, entry) => {
    root.querySelectorAll('.tabs').forEach((tabSet) => {
      const tabItems = [...tabSet.querySelectorAll('ul li[data-target]')];

      if (!tabItems.length) {
        return;
      }

      let activeItem = tabItems[0];

      if (entry.prefix === 'we' || entry.prefix === 'projects') {
        activeItem = tabItems.find((item) => item.dataset.target?.includes('tab-languages-')) || activeItem;
      }

      tabItems.forEach((item) => {
        item.classList.toggle('is-active', item === activeItem);
      });

      tabItems.forEach((item) => {
        const targetId = item.dataset.target;
        const target = targetId ? root.querySelector(`#${CSS.escape(targetId)}`) : null;

        if (!target) {
          return;
        }

        target.style.display = item === activeItem ? 'flex' : 'none';
      });
    });
  };

  const getDetailHeaderData = (entry) => {
    const { item, prefix } = entry;

    if (prefix === 'ed') {
      const degree = parseEducationDegree(item.degree);
      const majorLabel = degree.majors.includes(' and ') || degree.majors.includes(',') ? 'Majors' : 'Major';

      return {
        eyebrow: 'Education',
        title: degree.fullDegree,
        subtitle: degree.majors ? `${majorLabel}: ${degree.majors}` : '',
        meta: [
          { label: 'School', value: item.institution },
          { label: 'Location', value: item.location },
          { label: 'Period', value: formatSlashMonthRange(item.from, item.to) || item.period }
        ]
      };
    }

    if (prefix === 'we') {
      return {
        eyebrow: 'Work Experience',
        title: item.role,
        subtitle: item.company,
        meta: [
          { label: 'Location', value: item.location },
          { label: 'Period', value: formatSlashMonthRange(item.from, item.to) },
          { label: 'Sector', value: item.sector }
        ]
      };
    }

    if (prefix === 'projects') {
      return {
        eyebrow: 'Project',
        title: item.title,
        subtitle: item.type ? `${item.type} project` : '',
        meta: [
          { label: 'Date', value: entry.dateText }
        ]
      };
    }

    if (prefix === 'talks') {
      return {
        eyebrow: 'Talk',
        title: item.title,
        subtitle: item.venue,
        meta: [
          { label: 'Presented', value: entry.dateText }
        ]
      };
    }

    if (prefix === 'publications') {
      return {
        eyebrow: item.kind === 'blog' ? 'Writing' : 'Publication',
        title: item.title,
        subtitle: item.venue || 'Blog post',
        meta: [
          { label: 'Published', value: entry.dateText }
        ]
      };
    }

    if (prefix === 'service') {
      return {
        eyebrow: 'Service',
        title: item.title,
        subtitle: item.venue,
        meta: [
          { label: 'Date', value: entry.dateText }
        ]
      };
    }

    return {
      eyebrow: entry.label,
      title: entry.title,
      subtitle: '',
      meta: []
    };
  };

  const buildDetailHeader = (entry) => {
    const headerData = getDetailHeaderData(entry);
    const header = document.createElement('header');

    header.className = 'landing-detail-header';
    header.innerHTML = `
      <div class="landing-detail-title-block">
        <p class="landing-detail-eyebrow">${escapeHtml(headerData.eyebrow)}</p>
        <h2 class="landing-detail-title">${escapeHtml(headerData.title)}</h2>
        ${headerData.subtitle ? `<p class="landing-detail-subtitle">${escapeHtml(headerData.subtitle)}</p>` : ''}
      </div>
      ${headerData.meta.length ? `
        <div class="landing-detail-meta">
          ${headerData.meta.map((item) => `
            <div class="landing-detail-meta-item">
              <span class="landing-detail-meta-label">${escapeHtml(item.label)}</span>
              <span class="landing-detail-meta-value">${escapeHtml(item.value)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    return header;
  };

  const normalizeDetailContent = (clone, entry) => {
    [...clone.children].forEach((child) => {
      if (child.matches('.title, .subtitle')) {
        child.remove();
      }
    });

    if (entry.prefix === 'we') {
      unwrapHighlights(clone);
    }

    resetDetailTabs(clone, entry);
    clone.prepend(buildDetailHeader(entry));
  };

  const openEntryDetail = async (entryId) => {
    const entry = archiveEntriesById.get(entryId);

    if (!entry || !detailModal || !detailContent) {
      return;
    }

    await (window.modalRenderReady || Promise.resolve());

    const sourcePanel = document.getElementById(entry.sourcePanelId);
    const sourceSection = sourcePanel?.querySelector(`#${CSS.escape(entry.id)}`);

    if (!sourceSection) {
      return;
    }

    const clone = sourceSection.cloneNode(true);
    clone.removeAttribute('style');
    clone.id = `landing-${entry.id}`;
    uniquifyClone(clone, entry.id);
    normalizeDetailContent(clone, entry);

    detailContent.innerHTML = '';
    detailContent.appendChild(clone);

    if (detailDate) {
      detailDate.textContent = entry.dateText;
    }

    if (detailKind) {
      detailKind.textContent = entry.label;
    }

    detailModal.classList.add('is-active');
    detailModal.setAttribute('aria-hidden', 'false');

    if (window.Fancybox?.bind) {
      window.Fancybox.bind('#landing-detail-content [data-fancybox]', {});
    }

    if (window.MathJax?.typesetPromise) {
      await window.MathJax.typesetPromise([detailContent]);
    }
  };

  const closeLandingDetailModal = () => {
    if (!detailModal || !detailContent) {
      return;
    }

    detailModal.classList.remove('is-active');
    detailModal.setAttribute('aria-hidden', 'true');
    detailContent.innerHTML = '';
  };

  const handleArchiveClick = (event) => {
    const trigger = event.target.closest('[data-entry-id]');

    if (!trigger) {
      return;
    }

    event.preventDefault();
    openEntryDetail(trigger.dataset.entryId);
  };

  document.querySelectorAll('[data-placeholder-link="resume"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
    });
  });

  detailClose?.addEventListener('click', closeLandingDetailModal);
  detailModal?.querySelector('.modal-background')?.addEventListener('click', closeLandingDetailModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && detailModal?.classList.contains('is-active')) {
      closeLandingDetailModal();
    }
  });

  highlightList?.addEventListener('click', handleArchiveClick);
  scroll?.addEventListener('click', handleArchiveClick);

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((candidate) => candidate.classList.remove('is-active'));
      pill.classList.add('is-active');
      applyFilter(pill.dataset.filter);
    });
  });

  (async () => {
    try {
      const renderedData = await (window.modalRenderReady || Promise.resolve(window.renderedModalData || {}));
      const archiveEntries = buildArchiveEntries(renderedData);

      archiveEntries.forEach((entry) => {
        archiveEntriesById.set(entry.id, entry);
      });

      if (!archiveEntries.length) {
        renderArchiveMessage(highlightList, 'Archive data is not available right now.');
        renderArchiveMessage(scroll, 'Archive data is not available right now.');
        return;
      }

      renderHighlights(archiveEntries);
      renderIndex(archiveEntries);
      applyFilter(getActiveFilter());
    } catch (error) {
      console.error('Failed to initialize landing archive', error);
      renderArchiveMessage(highlightList, 'Archive data could not be loaded.');
      renderArchiveMessage(scroll, 'Archive data could not be loaded.');
    }
  })();
});
