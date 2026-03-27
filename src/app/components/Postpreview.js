// src/app/components/Postpreview.js
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

function fixUrl(url) {
  if (!url) return '#';
  const t = url.trim();
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  return 'https://' + t;
}

function getYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
  } catch {}
  return null;
}

function SectionBlock({ title, children }) {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>{title}</div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

// Dynamic KV Table — dates etc.
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

// VacancyGrid — type1 & type2
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

// ContentBlock — type3
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
        {job.total_vacancy && <span className={styles.badgeBlue}>📋 {job.total_vacancy} Posts</span>}
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

// ShortInfo — custom ya auto
function ShortInfo({ item }) {
  if (!item) return null;
  if (item.short_note && item.short_note.trim() !== '') {
    return <div className={styles.shortInfo} dangerouslySetInnerHTML={{ __html: item.short_note }} />;
  }
  const parts = [];
  if (item.organization && item.title) parts.push(`${item.organization} has released the official notification for <strong>${item.title}</strong>.`);
  if (item.total_vacancy) parts.push(`A total of <strong>${item.total_vacancy} vacancies</strong> are available.`);
  if (Array.isArray(item.qualification1) && item.qualification1.length > 0)
    parts.push(`Candidates with <strong>${item.qualification1.join(', ')}</strong> qualification are eligible.`);
  if (item.job_location) parts.push(`This vacancy is applicable for <strong>${item.job_location}</strong>.`);
  const lastDate = formatDate(item.important_dates?.last_date);
  const applyStart = formatDate(item.important_dates?.apply_start);
  if (applyStart && lastDate) parts.push(`Apply from <strong>${applyStart}</strong> to <strong>${lastDate}</strong>.`);
  else if (lastDate) parts.push(`Last date: <strong>${lastDate}</strong>.`);
  if (parts.length === 0) return null;
  return <div className={styles.shortInfo} dangerouslySetInnerHTML={{ __html: parts.join(' ') }} />;
}

// ImportantLinks
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

// VideoEmbed
function VideoEmbed({ url }) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, borderRadius: '8px', overflow: 'hidden' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
        />
      </div>
    </div>
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

        {/* Important Dates — dynamic */}
        {hasData(data.important_dates) && (
          <SectionBlock title="Important Dates">
            <KVTable data={data.important_dates} />
          </SectionBlock>
        )}

        {/* Qualification */}
        {Array.isArray(data.qualification1) && data.qualification1.length > 0 && (
          <SectionBlock title="Qualification">
            <ul className={styles.contentList}>
              {data.qualification1.map((q, i) => (
                <li key={i} className={styles.contentItem}><span className={styles.dot}>•</span><span>{q}</span></li>
              ))}
            </ul>
          </SectionBlock>
        )}

        {/* Type1 */}
        {Array.isArray(data.type1) && data.type1.map((grid, i) =>
          (grid?.rows?.length || grid?.oneline?.length) ? (
            <SectionBlock key={i} title={grid.title || 'Details'}>
              <VacancyGrid data={[grid]} />
            </SectionBlock>
          ) : null
        )}

        {/* Type2 */}
        {Array.isArray(data.type2) && data.type2.map((grid, i) =>
          (grid?.rows?.length || grid?.oneline?.length) ? (
            <SectionBlock key={i} title={grid.title || 'Details'}>
              <VacancyGrid data={[grid]} />
            </SectionBlock>
          ) : null
        )}

        {/* Type3 */}
        {Array.isArray(data.type3) && data.type3.map((block, i) =>
          block?.title ? (
            <SectionBlock key={i} title={block.title}>
              <ContentBlock data={[block]} />
            </SectionBlock>
          ) : null
        )}

        {/* Video */}
        {data.video?.url && (
          <SectionBlock title={data.video.title || 'Video'}>
            <VideoEmbed url={data.video.url} />
          </SectionBlock>
        )}

        {/* Important Links */}
        <SectionBlock title="Important Links">
          <ImportantLinks item={data} />
        </SectionBlock>

      </div>
    </div>
  );
}