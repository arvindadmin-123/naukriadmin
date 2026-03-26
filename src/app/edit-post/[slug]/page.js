// src/app/edit-post/[slug]/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileSidebar from '../../MobileSidebar';
import PostPreview from '../../components/Postpreview';
import styles from '../../new-post/new-post.module.css';

const CATEGORIES = ['Jobs', 'result', 'admit-card', 'answer-key', 'syllabus'];

const DEFAULT_DATES = {
  Jobs:         ['notification_release', 'apply_start', 'last_date', 'exam_date', 'admit_card_date', 'answer_key_date', 'result_date'],
  result:       ['exam_date', 'result_date'],
  'admit-card': ['exam_date', 'admit_card_date'],
  'answer-key': ['exam_date', 'answer_key_date'],
  syllabus:     ['exam_date'],
};

const DATE_LABELS = {
  notification_release: 'Notification Release',
  apply_start:          'Apply Start',
  last_date:            'Last Date',
  exam_date:            'Exam Date',
  admit_card_date:      'Admit Card Date',
  answer_key_date:      'Answer Key Date',
  result_date:          'Result Date',
};

const ALL_DATE_KEYS = Object.keys(DATE_LABELS);
const emptyTable = () => ({ title: '', columns: ['', ''], rows: [['', '']] });
const emptyBlock = () => ({ title: '', content: [''] });

// ✅ Blogger API config
const BLOG_ID = '4760900627062932844';
const POST_ID = '1971014663745817119';
const API_KEY = 'AIzaSyBcomLK77PJdaM7CXysztVxeAg8iVbF6c0';

async function fetchAllPosts() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${POST_ID}?key=${API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const arr = JSON.parse(data.content);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// string ya object dono parse karo
function parseField(field) {
  if (!field) return null;
  if (typeof field === 'string') {
    try { return JSON.parse(field); } catch { return null; }
  }
  return field;
}

export default function EditPostPage() {
  const { slug } = useParams();
  const router = useRouter();

  const toInputDate = (ddmmyyyy) => {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  };

  const fromInputDate = (yyyymmdd) => {
    if (!yyyymmdd) return '';
    const parts = yyyymmdd.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const getTodayDate = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  // State
  const [loading, setLoading]       = useState(true);
  const [originalId, setOriginalId] = useState('');
  const [allIds, setAllIds]         = useState([]);
  const [category, setCategory]     = useState('');
  const [title, setTitle]           = useState('');
  const [id, setId]                 = useState('');
  const [createdAt, setCreatedAt]   = useState('');
  const [organization, setOrganization] = useState('');
  const [totalVacancy, setTotalVacancy] = useState('');
  const [jobLocation, setJobLocation]   = useState('');
  const [tags, setTags]                         = useState(['']);
  const [qualification1, setQualification1]     = useState(['']);
  const [selectionProcess, setSelectionProcess] = useState(['']);
  const [dates, setDates]               = useState([]);
  const [links, setLinks]               = useState([{ name: '', url: '' }]);
  const [categoryLink, setCategoryLink] = useState('');
  const [feeMain, setFeeMain]         = useState({ general: '', obc: '', sc: '', st: '' });
  const [feeMorecast, setFeeMorecast] = useState([]);
  const [feeOneline, setFeeOneline]   = useState(['']);
  const [ageLimits, setAgeLimits]   = useState([{ title: '', age: '' }]);
  const [ageOneline, setAgeOneline] = useState(['']);
  const [postName, setPostName] = useState([]);
  const [tablev, setTablev]     = useState([]);
  const [table1, setTable1]     = useState([]);
  const [slugStatus, setSlugStatus]   = useState('available');
  const [preview, setPreview]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [confirmBack, setConfirmBack] = useState(false);
  const [error, setError]             = useState('');

  // ✅ Blogger API se data load
  useEffect(() => {
    async function loadJob() {
      const allPosts = await fetchAllPosts();
      setAllIds(allPosts.map(p => p.id).filter(Boolean));

      const data = allPosts.find(p => p.id === slug);
      if (!data) {
        setError('Post not found! Blogger API mein yeh ID nahi mili: ' + slug);
        setLoading(false);
        return;
      }

      setOriginalId(data.id);
      setCategory(data.category || 'Jobs');
      setTitle(data.title || '');
      setId(data.id || '');
      setCreatedAt(data.created_at || getTodayDate());
      setOrganization(data.organization || '');
      setTotalVacancy(data.total_vacancy != null ? String(data.total_vacancy) : '');
      setJobLocation(data.job_location || '');
      setTags(Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : ['']);
      setQualification1(Array.isArray(data.qualification1) && data.qualification1.length > 0 ? data.qualification1 : ['']);
      setSelectionProcess(Array.isArray(data.selection_process) && data.selection_process.length > 0 ? data.selection_process : ['']);

      // Dates
      if (data.important_dates && typeof data.important_dates === 'object') {
        const dateArr = Object.entries(data.important_dates)
          .filter(([, v]) => v)
          .map(([key, value]) => ({ key, value }));
        setDates(dateArr.length > 0 ? dateArr : (DEFAULT_DATES[data.category] || []).map(k => ({ key: k, value: '' })));
      }

      // Links
      if (data.important_links && typeof data.important_links === 'object') {
        const linkArr = Object.entries(data.important_links)
          .filter(([, v]) => v)
          .map(([name, url]) => ({ name: name.replace(/_/g, ' '), url }));
        setLinks(linkArr.length > 0 ? linkArr : [{ name: '', url: '' }]);
      }

      // Category link
      const jobs      = parseField(data.jobs);
      const result    = parseField(data.result);
      const admitCard = parseField(data.admit_card);
      const answerKey = parseField(data.answer_key);
      const syllabus  = parseField(data.syllabus);

      if (jobs?.apply_online)                    setCategoryLink(jobs.apply_online);
      else if (result?.download_result)          setCategoryLink(result.download_result);
      else if (admitCard?.download_admit_card)   setCategoryLink(admitCard.download_admit_card);
      else if (answerKey?.download_answer_key)   setCategoryLink(answerKey.download_answer_key);
      else if (syllabus?.download_syllabus)      setCategoryLink(syllabus.download_syllabus);

      // Fee
      if (data.application_fee) {
        setFeeMain({
          general: data.application_fee.general ?? '',
          obc:     data.application_fee.obc     ?? '',
          sc:      data.application_fee.sc      ?? '',
          st:      data.application_fee.st      ?? '',
        });
        setFeeMorecast(Array.isArray(data.application_fee.morecast) && data.application_fee.morecast.length > 0 ? data.application_fee.morecast : []);
        setFeeOneline(Array.isArray(data.application_fee.oneline) && data.application_fee.oneline.length > 0 ? data.application_fee.oneline : ['']);
      }

      // Age
      if (data.age_limit?.rows && Array.isArray(data.age_limit.rows)) {
        setAgeLimits(data.age_limit.rows.length > 0 ? data.age_limit.rows : [{ title: '', age: '' }]);
        setAgeOneline(Array.isArray(data.age_limit.oneline) && data.age_limit.oneline.length > 0 ? data.age_limit.oneline : ['']);
      } else if (Array.isArray(data.age_limit) && data.age_limit.length > 0) {
        setAgeLimits(data.age_limit);
      }

      setPostName(Array.isArray(data.post_name) && data.post_name.length > 0 ? data.post_name : []);
      setTablev(Array.isArray(data.tablev) && data.tablev.length > 0 ? data.tablev : []);
      setTable1(Array.isArray(data.table1) && data.table1.length > 0 ? data.table1 : []);
      setLoading(false);
    }
    loadJob();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ✅ Slug check — already loaded data se, no extra API call
  const checkSlug = useCallback((s) => {
    if (!s || s === originalId) { setSlugStatus('available'); return; }
    setSlugStatus(allIds.includes(s) ? 'taken' : 'available');
  }, [originalId, allIds]);

  useEffect(() => {
    const t = setTimeout(() => checkSlug(id), 400);
    return () => clearTimeout(t);
  }, [id, checkSlug]);

  // Helpers
  const updateArr = (setter, i, val) => setter(prev => prev.map((v, j) => j === i ? val : v));
  const addArr    = (setter) => setter(prev => [...prev, '']);
  const removeArr = (setter, i) => setter(prev => prev.filter((_, j) => j !== i));

  const updateDate = (i, f, v) => setDates(prev => prev.map((d, j) => j === i ? { ...d, [f]: v } : d));
  const addDate    = () => { const used = dates.map(d => d.key); const av = ALL_DATE_KEYS.find(k => !used.includes(k)); if (av) setDates(prev => [...prev, { key: av, value: '' }]); };
  const removeDate = (i) => setDates(prev => prev.filter((_, j) => j !== i));

  const updateLink = (i, f, v) => setLinks(prev => prev.map((l, j) => j === i ? { ...l, [f]: v } : l));
  const addLink    = () => setLinks(prev => [...prev, { name: '', url: '' }]);
  const removeLink = (i) => setLinks(prev => prev.filter((_, j) => j !== i));

  const addMorecast    = () => setFeeMorecast(prev => [...prev, { label: '', amount: '' }]);
  const removeMorecast = (i) => setFeeMorecast(prev => prev.filter((_, j) => j !== i));
  const updateMorecast = (i, f, v) => setFeeMorecast(prev => prev.map((m, j) => j === i ? { ...m, [f]: v } : m));

  const addAge    = () => setAgeLimits(prev => [...prev, { title: '', age: '' }]);
  const removeAge = (i) => setAgeLimits(prev => prev.filter((_, j) => j !== i));
  const updateAge = (i, f, v) => setAgeLimits(prev => prev.map((a, j) => j === i ? { ...a, [f]: v } : a));

  const addPostName       = () => setPostName(prev => [...prev, emptyTable()]);
  const removePostName    = (i) => setPostName(prev => prev.filter((_, j) => j !== i));
  const updatePostName    = (i, f, v) => setPostName(prev => prev.map((t, j) => j === i ? { ...t, [f]: v } : t));
  const addPostNameRow    = (i) => setPostName(prev => prev.map((t, j) => j === i ? { ...t, rows: [...t.rows, Array(t.columns.length).fill('')] } : t));
  const removePostNameRow = (ti, ri) => setPostName(prev => prev.map((t, j) => j === ti ? { ...t, rows: t.rows.filter((_, k) => k !== ri) } : t));
  const updatePostNameRow = (ti, ri, ci, val) => setPostName(prev => prev.map((t, j) => j === ti ? { ...t, rows: t.rows.map((r, k) => k === ri ? r.map((c, l) => l === ci ? val : c) : r) } : t));
  const updatePostNameCol = (ti, ci, val) => setPostName(prev => prev.map((t, j) => j === ti ? { ...t, columns: t.columns.map((c, k) => k === ci ? val : c) } : t));

  const addTablev       = () => setTablev(prev => [...prev, emptyTable()]);
  const removeTablev    = (i) => setTablev(prev => prev.filter((_, j) => j !== i));
  const updateTablev    = (i, f, v) => setTablev(prev => prev.map((t, j) => j === i ? { ...t, [f]: v } : t));
  const addTablevRow    = (i) => setTablev(prev => prev.map((t, j) => j === i ? { ...t, rows: [...t.rows, Array(t.columns.length).fill('')] } : t));
  const removeTablevRow = (ti, ri) => setTablev(prev => prev.map((t, j) => j === ti ? { ...t, rows: t.rows.filter((_, k) => k !== ri) } : t));
  const updateTablevRow = (ti, ri, ci, val) => setTablev(prev => prev.map((t, j) => j === ti ? { ...t, rows: t.rows.map((r, k) => k === ri ? r.map((c, l) => l === ci ? val : c) : r) } : t));
  const updateTablevCol = (ti, ci, val) => setTablev(prev => prev.map((t, j) => j === ti ? { ...t, columns: t.columns.map((c, k) => k === ci ? val : c) } : t));
  const addTablevCol    = (i) => setTablev(prev => prev.map((t, j) => j === i ? { ...t, columns: [...t.columns, ''], rows: t.rows.map(r => [...r, '']) } : t));
  const removeTablevCol = (ti, ci) => setTablev(prev => prev.map((t, j) => j === ti ? { ...t, columns: t.columns.filter((_, k) => k !== ci), rows: t.rows.map(r => r.filter((_, k) => k !== ci)) } : t));

  const addTable1         = () => setTable1(prev => [...prev, emptyBlock()]);
  const removeTable1      = (i) => setTable1(prev => prev.filter((_, j) => j !== i));
  const updateTable1Title = (i, v) => setTable1(prev => prev.map((b, j) => j === i ? { ...b, title: v } : b));
  const addTable1Item     = (i) => setTable1(prev => prev.map((b, j) => j === i ? { ...b, content: [...b.content, ''] } : b));
  const removeTable1Item  = (bi, ii) => setTable1(prev => prev.map((b, j) => j === bi ? { ...b, content: b.content.filter((_, k) => k !== ii) } : b));
  const updateTable1Item  = (bi, ii, v) => setTable1(prev => prev.map((b, j) => j === bi ? { ...b, content: b.content.map((c, k) => k === ii ? v : c) } : b));

  const buildData = useCallback(() => {
    const importantDates = {};
    dates.forEach(d => { if (d.key && d.value) importantDates[d.key] = d.value; });
    const importantLinks = {};
    links.forEach(l => { if (l.name && l.url) importantLinks[l.name.toLowerCase().replace(/\s+/g, '_')] = l.url; });

    return {
      id, created_at: createdAt, category, title,
      organization: organization || null,
      total_vacancy: totalVacancy ? Number(totalVacancy) : null,
      job_location: jobLocation || null,
      tags: tags.filter(Boolean),
      qualification1: qualification1.filter(Boolean),
      important_dates: importantDates,
      application_fee: category === 'Jobs' ? {
        general: feeMain.general || 0, obc: feeMain.obc || 0,
        sc: feeMain.sc || 0, st: feeMain.st || 0,
        morecast: feeMorecast.filter(m => m.label).map(m => ({ label: m.label, amount: m.amount || 0 })),
        oneline: feeOneline.filter(Boolean),
      } : null,
      age_limit: category === 'Jobs' ? {
        rows: ageLimits.filter(a => a.title && a.age),
        oneline: ageOneline.filter(Boolean),
      } : null,
      selection_process: selectionProcess.filter(Boolean),
      important_links: importantLinks,
      jobs:       category === 'Jobs'       && categoryLink ? { apply_online:        categoryLink } : null,
      result:     category === 'result'     && categoryLink ? { download_result:     categoryLink } : null,
      admit_card: category === 'admit-card' && categoryLink ? { download_admit_card: categoryLink } : null,
      answer_key: category === 'answer-key' && categoryLink ? { download_answer_key: categoryLink } : null,
      syllabus:   category === 'syllabus'   && categoryLink ? { download_syllabus:   categoryLink } : null,
      post_name: postName.filter(t => t.rows.length > 0),
      tablev:    tablev.filter(t => t.rows.length > 0),
      table1:    table1.filter(b => b.title),
    };
  }, [id, createdAt, category, title, organization, totalVacancy, jobLocation, tags, qualification1, selectionProcess, dates, links, categoryLink, feeMain, feeMorecast, feeOneline, ageLimits, ageOneline, postName, tablev, table1]);

  // ✅ Copy JSON
  const handleCopyJson = () => {
    if (!id || !title || !category) { setError('Title, URL aur Category zaroori hai!'); return; }
    if (slugStatus === 'taken') { setError('Yeh URL already exist karta hai!'); return; }
    setError('');
    navigator.clipboard.writeText(JSON.stringify(buildData(), null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const catLinkLabel = {
    Jobs: 'Apply Online URL', result: 'Download Result URL',
    'admit-card': 'Download Admit Card URL', 'answer-key': 'Download Answer Key URL',
    syllabus: 'Download Syllabus URL',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'var(--font-poppins)', color: '#1a3fa3', fontSize: '1rem' }}>
      ⏳ Loading post data from Blogger...
    </div>
  );

  const data = buildData();

  return (
    <div className={styles.wrap}>
      <MobileSidebar active="posts" />
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoText}>Sidhe<span>Naukri</span></span>
          <span className={styles.logoSub}>Admin</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>📊 Dashboard</Link>
          <Link href="/new-post" className={styles.navLink}>✏️ New Post</Link>
          <Link href="/posts" className={`${styles.navLink} ${styles.active}`}>📋 All Posts</Link>
        </nav>
        <form action="/api/admin/logout" method="POST" className={styles.logoutWrap}>
          <button type="submit" className={styles.logoutBtn}>🚪 Logout</button>
        </form>
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => setConfirmBack(true)}>← Back</button>
            <h1 className={styles.title}>Edit Post <span className={styles.catBadge}>{category}</span></h1>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.previewBtn} onClick={() => setPreview(p => !p)}>
              {preview ? '📝 Edit' : '👁 Preview'}
            </button>
            <button className={styles.copyBtn} onClick={handleCopyJson} disabled={slugStatus === 'taken'}>
              {copied ? '✅ Copied!' : '📋 Copy JSON'}
            </button>
          </div>
        </div>

        {copied && <div className={styles.successMsg}>✅ Updated JSON copy ho gaya! Blogger post mein us entry ko replace karo.</div>}
        {error  && <div className={styles.errorMsg}>{error}</div>}

        {!preview && (
          <div className={styles.formGrid}>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Basic Information</h2>
              <div className={styles.field}><label>Title *</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className={styles.field}>
                <label>URL (Slug) *
                  {slugStatus === 'checking'  && <span className={styles.checking}> ⏳ Checking...</span>}
                  {slugStatus === 'available' && <span className={styles.available}> ✅ Available</span>}
                  {slugStatus === 'taken'     && <span className={styles.taken}> ❌ Already taken</span>}
                </label>
                <input value={id} onChange={e => setId(e.target.value)} />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Post Date</label>
                  <input type="date" value={toInputDate(createdAt)} onChange={e => setCreatedAt(fromInputDate(e.target.value))} />
                </div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Organization</label><input value={organization} onChange={e => setOrganization(e.target.value)} /></div>
                <div className={styles.field}><label>Total Vacancy</label><input type="number" value={totalVacancy} onChange={e => setTotalVacancy(e.target.value)} /></div>
              </div>
              <div className={styles.field}><label>Job Location</label><input value={jobLocation} onChange={e => setJobLocation(e.target.value)} /></div>

              <div className={styles.field}>
                <label>Tags</label>
                {tags.map((tag, i) => (
                  <div key={i} className={styles.inlineRow}>
                    <input value={tag} onChange={e => updateArr(setTags, i, e.target.value)} placeholder="ssc / police..." />
                    {tags.length > 1 && <button className={styles.removeInlineBtn} onClick={() => removeArr(setTags, i)}>✕</button>}
                  </div>
                ))}
                <button className={styles.addBtn} onClick={() => addArr(setTags)}>+ Add Tag</button>
              </div>

              <div className={styles.field}>
                <label>Qualification Details</label>
                {qualification1.map((q, i) => (
                  <div key={i} className={styles.inlineRow}>
                    <input value={q} onChange={e => updateArr(setQualification1, i, e.target.value)} placeholder="12th pass / Graduate..." />
                    {qualification1.length > 1 && <button className={styles.removeInlineBtn} onClick={() => removeArr(setQualification1, i)}>✕</button>}
                  </div>
                ))}
                <button className={styles.addBtn} onClick={() => addArr(setQualification1)}>+ Add Qualification</button>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>{catLinkLabel[category] || 'Main Link'}</h2>
              <div className={styles.field}>
                <label>{catLinkLabel[category]}</label>
                <input value={categoryLink} onChange={e => setCategoryLink(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Important Dates (DD/MM/YYYY)</h2>
              {dates.map((d, i) => (
                <div key={i} className={styles.dynamicRow}>
                  <div className={styles.field} style={{ flex: '0 0 180px' }}>
                    <label>Date Type</label>
                    <select value={d.key} onChange={e => updateDate(i, 'key', e.target.value)}>
                      {ALL_DATE_KEYS.map(k => <option key={k} value={k}>{DATE_LABELS[k]}</option>)}
                    </select>
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label>Date</label>
                    <input type="date" value={toInputDate(d.value)} onChange={e => updateDate(i, 'value', fromInputDate(e.target.value))} />
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeDate(i)}>✕</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={addDate}>+ Add Date</button>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Important Links</h2>
              {links.map((l, i) => (
                <div key={i} className={styles.dynamicRow}>
                  <div className={styles.field} style={{ flex: '0 0 180px' }}><label>Link Name</label><input value={l.name} onChange={e => updateLink(i, 'name', e.target.value)} placeholder="Official Website" /></div>
                  <div className={styles.field} style={{ flex: 1 }}><label>URL</label><input value={l.url} onChange={e => updateLink(i, 'url', e.target.value)} placeholder="https://..." /></div>
                  {links.length > 1 && <button className={styles.removeBtn} onClick={() => removeLink(i)}>✕</button>}
                </div>
              ))}
              <button className={styles.addBtn} onClick={addLink}>+ Add Link</button>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Data Type1 (Table)</h2>
              {postName.map((t, ti) => (
                <div key={ti} className={styles.tableBlock}>
                  <div className={styles.tableBlockHeader}>
                    <input className={styles.tableTitleInput} value={t.title} onChange={e => updatePostName(ti, 'title', e.target.value)} placeholder="Post Wise Vacancy" />
                    <button className={styles.removeBtn} onClick={() => removePostName(ti)}>✕ Remove</button>
                  </div>
                  <div className={styles.tableGrid}>
                    <div className={styles.tableHeaderRow}>
                      {t.columns.map((col, ci) => (
                        <div key={ci} className={styles.tableColWrap}>
                          <input className={styles.tableColInput} value={col} onChange={e => updatePostNameCol(ti, ci, e.target.value)} placeholder={`Column ${ci + 1}`} />
                        </div>
                      ))}
                    </div>
                    {t.rows.map((row, ri) => (
                      <div key={ri} className={styles.tableRow}>
                        {row.map((cell, ci) => (
                          <input key={ci} className={styles.tableCellInput} value={cell} onChange={e => updatePostNameRow(ti, ri, ci, e.target.value)} placeholder={ci === 0 ? 'Post Name' : 'Count'} />
                        ))}
                        <button className={styles.removeRowBtn} onClick={() => removePostNameRow(ti, ri)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <button className={styles.addBtn} style={{ marginTop: 8 }} onClick={() => addPostNameRow(ti)}>+ Add Row</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={addPostName}>+ Add Post Name Table</button>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Data Type2 (tablev)</h2>
              {tablev.map((t, ti) => (
                <div key={ti} className={styles.tableBlock}>
                  <div className={styles.tableBlockHeader}>
                    <input className={styles.tableTitleInput} value={t.title} onChange={e => updateTablev(ti, 'title', e.target.value)} placeholder="Post Wise Vacancy" />
                    <button className={styles.removeBtn} onClick={() => removeTablev(ti)}>✕ Remove</button>
                  </div>
                  <div className={styles.tableGrid}>
                    <div className={styles.tableHeaderRow}>
                      {t.columns.map((col, ci) => (
                        <div key={ci} className={styles.tableColWrap}>
                          <input className={styles.tableColInput} value={col} onChange={e => updateTablevCol(ti, ci, e.target.value)} placeholder={`Column ${ci + 1}`} />
                          {t.columns.length > 1 && <button className={styles.removeColBtn} onClick={() => removeTablevCol(ti, ci)}>✕</button>}
                        </div>
                      ))}
                      <button className={styles.addColBtn} onClick={() => addTablevCol(ti)}>+ Col</button>
                    </div>
                    {t.rows.map((row, ri) => (
                      <div key={ri} className={styles.tableRow}>
                        {row.map((cell, ci) => (
                          <input key={ci} className={styles.tableCellInput} value={cell} onChange={e => updateTablevRow(ti, ri, ci, e.target.value)} placeholder={`Row ${ri + 1} Col ${ci + 1}`} />
                        ))}
                        <button className={styles.removeRowBtn} onClick={() => removeTablevRow(ti, ri)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <button className={styles.addBtn} style={{ marginTop: 8 }} onClick={() => addTablevRow(ti)}>+ Add Row</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={addTablev}>+ Add Vacancy Table</button>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Data Type3 (table1)</h2>
              {table1.map((b, bi) => (
                <div key={bi} className={styles.tableBlock}>
                  <div className={styles.tableBlockHeader}>
                    <input className={styles.tableTitleInput} value={b.title} onChange={e => updateTable1Title(bi, e.target.value)} placeholder="Important Notice" />
                    <button className={styles.removeBtn} onClick={() => removeTable1(bi)}>✕ Remove</button>
                  </div>
                  {b.content.map((item, ii) => (
                    <div key={ii} className={styles.inlineRow}>
                      <input value={item} onChange={e => updateTable1Item(bi, ii, e.target.value)} placeholder="Bullet point text..." />
                      {b.content.length > 1 && <button className={styles.removeInlineBtn} onClick={() => removeTable1Item(bi, ii)}>✕</button>}
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={() => addTable1Item(bi)}>+ Add Point</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={addTable1}>+ Add Content Block</button>
            </div>

            {category === 'Jobs' && (
              <>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Application Fee (₹)</h2>
                  <div className={styles.row3}>
                    <div className={styles.field}><label>General</label><input value={feeMain.general} onChange={e => setFeeMain(f => ({ ...f, general: e.target.value }))} /></div>
                    <div className={styles.field}><label>OBC</label><input value={feeMain.obc} onChange={e => setFeeMain(f => ({ ...f, obc: e.target.value }))} /></div>
                    <div className={styles.field}><label>SC</label><input value={feeMain.sc} onChange={e => setFeeMain(f => ({ ...f, sc: e.target.value }))} /></div>
                  </div>
                  <div className={styles.field}><label>ST</label><input value={feeMain.st} onChange={e => setFeeMain(f => ({ ...f, st: e.target.value }))} /></div>
                  {feeMorecast.length > 0 && <div className={styles.subLabel}>Additional Categories</div>}
                  {feeMorecast.map((m, i) => (
                    <div key={i} className={styles.dynamicRow}>
                      <div className={styles.field} style={{ flex: '0 0 160px' }}><label>Category</label><input value={m.label} onChange={e => updateMorecast(i, 'label', e.target.value)} placeholder="PWD" /></div>
                      <div className={styles.field} style={{ flex: 1 }}><label>Amount (₹)</label><input value={m.amount} onChange={e => updateMorecast(i, 'amount', e.target.value)} placeholder="0" /></div>
                      <button className={styles.removeBtn} onClick={() => removeMorecast(i)}>✕</button>
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={addMorecast}>+ Add Category</button>
                  <div className={styles.subLabel} style={{ marginTop: 12 }}>One Line Info</div>
                  {feeOneline.map((item, i) => (
                    <div key={i} className={styles.inlineRow}>
                      <input value={item} onChange={e => updateArr(setFeeOneline, i, e.target.value)} placeholder="Payment Mode: Online only" />
                      {feeOneline.length > 1 && <button className={styles.removeInlineBtn} onClick={() => removeArr(setFeeOneline, i)}>✕</button>}
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={() => addArr(setFeeOneline)}>+ Add Info Line</button>
                </div>

                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Age Limit</h2>
                  {ageLimits.map((a, i) => (
                    <div key={i} className={styles.dynamicRow}>
                      <div className={styles.field} style={{ flex: '0 0 200px' }}><label>Category</label><input value={a.title} onChange={e => updateAge(i, 'title', e.target.value)} placeholder="General / OBC" /></div>
                      <div className={styles.field} style={{ flex: 1 }}><label>Age Range</label><input value={a.age} onChange={e => updateAge(i, 'age', e.target.value)} placeholder="18-25 Years" /></div>
                      {ageLimits.length > 1 && <button className={styles.removeBtn} onClick={() => removeAge(i)}>✕</button>}
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={addAge}>+ Add Age Category</button>
                  <div className={styles.subLabel} style={{ marginTop: 12 }}>One Line Info</div>
                  {ageOneline.map((item, i) => (
                    <div key={i} className={styles.inlineRow}>
                      <input value={item} onChange={e => updateArr(setAgeOneline, i, e.target.value)} placeholder="Age relaxation as per govt rules" />
                      {ageOneline.length > 1 && <button className={styles.removeInlineBtn} onClick={() => removeArr(setAgeOneline, i)}>✕</button>}
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={() => addArr(setAgeOneline)}>+ Add Info Line</button>
                </div>
              </>
            )}

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Selection Process</h2>
              {selectionProcess.map((s, i) => (
                <div key={i} className={styles.inlineRow}>
                  <input value={s} onChange={e => updateArr(setSelectionProcess, i, e.target.value)} placeholder="Written Exam / Physical Test..." />
                  {selectionProcess.length > 1 && <button className={styles.removeInlineBtn} onClick={() => removeArr(setSelectionProcess, i)}>✕</button>}
                </div>
              ))}
              <button className={styles.addBtn} onClick={() => addArr(setSelectionProcess)}>+ Add Step</button>
            </div>

            {/* Bottom Copy Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 32 }}>
              <button
                className={styles.copyBtn}
                onClick={handleCopyJson}
                disabled={slugStatus === 'taken'}
                style={{ fontSize: '1rem', padding: '13px 32px' }}
              >
                {copied ? '✅ JSON Copied!' : '📋 Copy Updated JSON for Blogger'}
              </button>
            </div>

          </div>
        )}

        {preview && <PostPreview data={data} />}

        {confirmBack && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalIcon}>⚠️</div>
              <h3 className={styles.modalTitle}>Wapas Jaana Chahte Ho?</h3>
              <p className={styles.modalText}>Saare unsaved changes kho jaayenge!</p>
              <div className={styles.modalBtns}>
                <button className={styles.modalCancelBtn} onClick={() => setConfirmBack(false)}>✕ Ruko</button>
                <button className={styles.modalConfirmBtn} onClick={() => router.back()}>Haan, Wapas Jao</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}