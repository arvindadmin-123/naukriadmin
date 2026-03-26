// src/app/components/PostPreview.js
'use client';
import styles from './PostPreview.module.css';

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const parts = String(dateStr).split('/');
    if (parts.length === 3) {
      const d = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
      if (isNaN(d)) return dateStr;
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch { return dateStr; }
}

function formatLabel(key) {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function hasData(obj) {
  if (!obj) return false;
  if (Array.isArray(obj)) return obj.length > 0;
  if (typeof obj === 'object') return Object.values(obj).some(v => v !== null && v !== undefined && v !== '');
  return Boolean(obj);
}

function renderFeeVal(val) {
  if (val === null || val === undefined || val === '') return '—';
  if (val === 0 || val === '0' || Number(val) === 0) return <span className={styles.free}>Free</span>;
  if (!isNaN(Number(val)) && val !== '') return `₹ ${Number(val)}`;
  return String(val);
}

// URL fix
function fixUrl(url) {
  if (!url) return '#';
  const t = url.trim();
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  return 'https://' + t;
}

function SectionBlock({ title, children }) {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>{title}</div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

function KVTable({ data = {} }) {
  if (!data || typeof data !== 'object') return null;
  const rows = Object.entries(data).filter(([, v]) =>
    v !== null && v !== undefined && v !== '' && !Array.isArray(v) && typeof v !== 'object'
  );
  if (rows.length === 0) return null;
  return (
    <table className={styles.kvTable}>
      <tbody>
        {rows.map(([key, value]) => (
          <tr key={key}>
            <td className={styles.kvLabel}>{formatLabel(key)}</td>
            <td className={styles.kvValue}>
              {typeof value === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)
                ? formatDate(value)
                : String(value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FeeTable({ fee }) {
  if (!fee || typeof fee !== 'object') return null;
  const mainKeys = ['general', 'obc', 'sc', 'st'];
  const mainRows = mainKeys.filter(k => fee[k] !== undefined && fee[k] !== null && fee[k] !== '');
  const morecast = Array.isArray(fee.morecast) ? fee.morecast.filter(m => m.label) : [];
  const oneline  = Array.isArray(fee.oneline)  ? fee.oneline.filter(Boolean) : [];
  if (mainRows.length === 0 && morecast.length === 0) return null;
  return (
    <>
      <table className={styles.kvTable}>
        <tbody>
          {mainRows.map(key => (
            <tr key={key}>
              <td className={styles.kvLabel}>{formatLabel(key)}</td>
              <td className={styles.kvValue}>{renderFeeVal(fee[key])}</td>
            </tr>
          ))}
          {morecast.map((m, i) => (
            <tr key={`m-${i}`}>
              <td className={styles.kvLabel}>{m.label}</td>
              <td className={styles.kvValue}>{renderFeeVal(m.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {oneline.length > 0 && (
        <div className={styles.oneline}>
          {oneline.map((item, i) => <span key={i} className={styles.onelineItem}>{item}</span>)}
        </div>
      )}
    </>
  );
}

function AgeTable({ age }) {
  if (!age) return null;
  let rows = [];
  let oneline = [];
  if (age.rows && Array.isArray(age.rows)) {
    rows = age.rows.filter(r => r.title && r.age);
    oneline = Array.isArray(age.oneline) ? age.oneline.filter(Boolean) : [];
  } else if (Array.isArray(age)) {
    rows = age.filter(r => r.title && r.age);
  }
  if (rows.length === 0) return null;
  return (
    <>
      <table className={styles.kvTable}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className={styles.kvLabel}>{row.title}</td>
              <td className={styles.kvValue}>{row.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {oneline.length > 0 && (
        <div className={styles.oneline}>
          {oneline.map((item, i) => <span key={i} className={styles.onelineItem}>{item}</span>)}
        </div>
      )}
    </>
  );
}

// VacancyGrid — oneline support added
function VacancyGrid({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  return (
    <>
      {data.map((grid, i) => {
        if (!grid?.rows?.length && !grid?.oneline?.length) return null;
        const oneline = Array.isArray(grid.oneline) ? grid.oneline.filter(Boolean) : [];
        return (
          <div key={i}>
            {grid.rows?.length > 0 && (
              <div className={styles.vacancyWrap}>
                <table className={styles.vacancyTable}>
                  {grid.columns?.length > 0 && (
                    <thead>
                      <tr>{grid.columns.map((col, j) => <th key={j}>{col}</th>)}</tr>
                    </thead>
                  )}
                  <tbody>
                    {grid.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k} className={k === 0 ? styles.tdLabel : styles.tdValue}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {oneline.length > 0 && (
              <div className={styles.oneline}>
                {oneline.map((item, j) => <span key={j} className={styles.onelineItem}>{item}</span>)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ContentBlock — oneline support added
function ContentBlock({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  return (
    <>
      {data.map((block, i) => {
        if (!block) return null;
        const oneline = Array.isArray(block.oneline) ? block.oneline.filter(Boolean) : [];
        return (
          <div key={i}>
            {Array.isArray(block.content) && block.content.length > 0 && (
              <ul className={styles.contentList}>
                {block.content.map((point, j) => (
                  <li key={j} className={styles.contentItem}>
                    <span className={styles.dot}>•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            {oneline.length > 0 && (
              <div className={styles.oneline}>
                {oneline.map((item, j) => <span key={j} className={styles.onelineItem}>{item}</span>)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function SelectionProcess({ steps = [] }) {
  if (!steps?.length) return null;
  return (
    <ol className={styles.selectionList}>
      {steps.map((step, i) => (
        <li key={i} className={styles.selectionItem}>
          <span className={styles.stepNum}>{i + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function JobHero({ job }) {
  const CAT_COLORS = {
    'jobs':       { bg: '#e8f5e9', color: '#2e7d32' },
    'result':     { bg: '#fff3e0', color: '#e67e22' },
    'admit-card': { bg: '#e3f2fd', color: '#1565c0' },
    'answer-key': { bg: '#fce4ec', color: '#c62828' },
    'syllabus':   { bg: '#f3e5f5', color: '#6a1b9a' },
  };
  const cat = (job.category || '').toLowerCase();
  const catStyle = CAT_COLORS[cat] || { bg: '#eef1fb', color: '#1a3fa3' };
  const lastDate = formatDate(job.important_dates?.last_date);
  const postDate = formatDate(job.created_at);
  const genericTags = ['govt jobs', 'sarkari naukri', 'result', 'admit-card', 'answer-key'];
  const displayTags = Array.isArray(job.tags) ? job.tags.filter(t => !genericTags.includes(t.toLowerCase())).slice(0, 4) : [];
  const TAG_GRADIENTS = [
    'linear-gradient(135deg, #4a6fd4, #7b9ef0)',
    'linear-gradient(135deg, #5b8dd9, #89b4f0)',
    'linear-gradient(135deg, #4caf7d, #76c99a)',
    'linear-gradient(135deg, #42a5c8, #6ec6e3)',
  ];
  return (
    <div className={styles.hero}>
      <span className={styles.catTag} style={{ background: catStyle.bg, color: catStyle.color }}>{job.category}</span>
      <h1 className={styles.heroTitle}>{job.title}</h1>
      <div className={styles.badges}>
        {job.total_vacancy && <span className={styles.badgeBlue}>📋 {Number(job.total_vacancy).toLocaleString()} Posts</span>}
        {lastDate && <span className={styles.badgeOrange}>📅 Last Date: {lastDate}</span>}
        {job.job_location && <span className={styles.badgeGray}>📍 {job.job_location}</span>}
      </div>
      {displayTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '8px 0' }}>
          {displayTags.map((tag, i) => (
            <span key={i} style={{ background: TAG_GRADIENTS[i % TAG_GRADIENTS.length], color: '#fff', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', fontFamily: 'var(--font-poppins), sans-serif' }}>{tag}</span>
          ))}
        </div>
      )}
      <ul className={styles.meta}>
        {postDate          && <li><span className={styles.metaDot}>●</span> Post Date: <strong>{postDate}</strong></li>}
        {job.organization  && <li><span className={styles.metaDot}>●</span> Organization: <strong>{job.organization}</strong></li>}
        {job.total_vacancy && <li><span className={styles.metaDot}>●</span> Total Vacancy: <strong>{job.total_vacancy}</strong></li>}
      </ul>
    </div>
  );
}

function ShortInfo({ item }) {
  if (!item) return null;
  const parts = [];
  if (item.organization && item.title) parts.push(`${item.organization} has released the official notification for <strong>${item.title}</strong>.`);
  if (item.total_vacancy) parts.push(`A total of <strong>${Number(item.total_vacancy).toLocaleString()} vacancies</strong> are available.`);
  if (Array.isArray(item.qualification1) && item.qualification1.length > 0)
    parts.push(`Candidates with <strong>${item.qualification1.join(', ')}</strong> qualification are eligible.`);
  if (item.age_limit?.rows?.length > 0) {
    const ageStr = item.age_limit.rows.map(a => `${a.title}: ${a.age}`).join(', ');
    parts.push(`Age limit — <strong>${ageStr}</strong>.`);
  }
  if (item.job_location) parts.push(`This vacancy is applicable for <strong>${item.job_location}</strong>.`);
  const applyStart = formatDate(item.important_dates?.apply_start);
  const lastDate   = formatDate(item.important_dates?.last_date);
  if (applyStart && lastDate) parts.push(`Apply from <strong>${applyStart}</strong> to <strong>${lastDate}</strong>.`);
  else if (lastDate) parts.push(`Last date to apply: <strong>${lastDate}</strong>.`);
  if (item.result?.download_result)         parts.push(`Result has been declared and is available for download.`);
  if (item.admit_card?.download_admit_card) parts.push(`Admit card is now available for download.`);
  if (item.answer_key?.download_answer_key) parts.push(`Official answer key has been released.`);
  if (item.syllabus?.download_syllabus)     parts.push(`Official syllabus PDF is available for download.`);
  if (parts.length === 0) return null;
  return (
    <div className={styles.shortInfo}>
      <span className={styles.shortInfoLabel}>Short Information : </span>
      <span dangerouslySetInnerHTML={{ __html: parts.join(' ') }} />
    </div>
  );
}

// ImportantLinks — url fix + sab links show karo
function ImportantLinks({ item = {} }) {
  const allLinks = [];
  if (item.jobs?.apply_online)              allLinks.push({ label: 'Apply Online',       url: fixUrl(item.jobs.apply_online),              cls: 'green' });
  if (item.result?.download_result)         allLinks.push({ label: 'Download Result',     url: fixUrl(item.result.download_result),          cls: 'orange' });
  if (item.admit_card?.download_admit_card) allLinks.push({ label: 'Download Admit Card', url: fixUrl(item.admit_card.download_admit_card),  cls: 'blue' });
  if (item.answer_key?.download_answer_key) allLinks.push({ label: 'Download Answer Key', url: fixUrl(item.answer_key.download_answer_key),  cls: 'blue' });
  if (item.syllabus?.download_syllabus)     allLinks.push({ label: 'Download Syllabus',   url: fixUrl(item.syllabus.download_syllabus),      cls: 'green' });
  if (item.important_links && typeof item.important_links === 'object') {
    Object.entries(item.important_links).forEach(([key, url]) => {
      if (url && typeof url === 'string' && url.trim() !== '')
        allLinks.push({ label: formatLabel(key), url: fixUrl(url), cls: 'blue' });
    });
  }
  if (allLinks.length === 0) return null;
  return (
    <ul className={styles.linksList}>
      {allLinks.map((l, i) => (
        <li key={i} className={styles.linksItem}>
          <span className={styles.linkDot}>●</span>
          <span className={styles.linkLabel}>{l.label}</span>
          <a href={l.url} target="_blank" rel="noopener noreferrer" className={`${styles.linkBtn} ${styles[`btn_${l.cls}`]}`}>
            Click Here ›
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function PostPreview({ data }) {
  if (!data) return null;
  return (
    <div className={styles.previewWrap}>
      <div className={styles.previewInner}>
        <nav className={styles.breadcrumb}>
          <span className={styles.breadLink}>Home</span>
          <span className={styles.breadSep}>›</span>
          <span className={styles.breadLink}>{data.category}</span>
          <span className={styles.breadSep}>›</span>
          <span className={styles.breadCurrent}>{data.title}</span>
        </nav>

        <JobHero job={data} />

        <SectionBlock title="Short Information">
          <ShortInfo item={data} />
        </SectionBlock>

        {hasData(data.important_dates) && (
          <SectionBlock title="Important Dates">
            <KVTable data={data.important_dates} />
          </SectionBlock>
        )}

        {Array.isArray(data.post_name) && data.post_name.map((grid, i) =>
          (grid?.rows?.length || grid?.oneline?.length) ? (
            <SectionBlock key={i} title={grid.title || 'Post Name'}>
              <VacancyGrid data={[grid]} />
            </SectionBlock>
          ) : null
        )}

        {Array.isArray(data.qualification1) && data.qualification1.length > 0 && (
          <SectionBlock title="Qualification">
            <ul className={styles.contentList}>
              {data.qualification1.map((q, i) => (
                <li key={i} className={styles.contentItem}><span className={styles.dot}>•</span><span>{q}</span></li>
              ))}
            </ul>
          </SectionBlock>
        )}

        {hasData(data.application_fee) && (
          <SectionBlock title="Application Fee">
            <FeeTable fee={data.application_fee} />
          </SectionBlock>
        )}

        {data.age_limit && (
          <SectionBlock title="Age Limit">
            <AgeTable age={data.age_limit} />
          </SectionBlock>
        )}

        {Array.isArray(data.tablev) && data.tablev.map((grid, i) =>
          (grid?.rows?.length || grid?.oneline?.length) ? (
            <SectionBlock key={i} title={grid.title || 'Vacancy Details'}>
              <VacancyGrid data={[grid]} />
            </SectionBlock>
          ) : null
        )}

        {Array.isArray(data.selection_process) && data.selection_process.length > 0 && (
          <SectionBlock title="Selection Process">
            <SelectionProcess steps={data.selection_process} />
          </SectionBlock>
        )}

        {Array.isArray(data.table1) && data.table1.map((block, i) =>
          block?.title ? (
            <SectionBlock key={i} title={block.title}>
              <ContentBlock data={[block]} />
            </SectionBlock>
          ) : null
        )}

        <SectionBlock title="Important Links">
          <ImportantLinks item={data} />
        </SectionBlock>
      </div>
    </div>
  );
}