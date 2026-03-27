// src/app/edit-post/[slug]/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileSidebar from '../../MobileSidebar';
import PostPreview from '../../components/Postpreview';
import styles from '../../new-post/new-post.module.css';

const CATEGORIES = ['Jobs', 'result', 'admit-card', 'answer-key', 'syllabus'];
const BLOG_ID = '2842912977848904218';
const POST_ID = '3377912945921363783';
const API_KEY = 'AIzaSyALruA3pculIf5zjHeam_wq3fOHQSUJZ7o';

const emptyTable = () => ({ title: '', columns: ['', ''], rows: [['', '']], oneline: [] });
const emptyBlock = () => ({ title: '', content: [''], oneline: [] });

async function fetchAllPosts() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${POST_ID}?key=${API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const arr = JSON.parse(data.content);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
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
  const [shortNote, setShortNote]       = useState('');
  const [tags, setTags]                     = useState(['']);
  const [qualification1, setQualification1] = useState(['']);
  const [dates, setDates]               = useState([{ key: '', value: '' }]);
  const [links, setLinks]               = useState([{ name: '', url: '' }]);
  const [categoryLink, setCategoryLink] = useState('');
  const [videoTitle, setVideoTitle]     = useState('');
  const [videoUrl, setVideoUrl]         = useState('');
  const [type1, setType1] = useState([]);
  const [type2, setType2] = useState([]);
  const [type3, setType3] = useState([]);
  const [slugStatus, setSlugStatus]   = useState('available');
  const [preview, setPreview]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [confirmBack, setConfirmBack] = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    async function loadJob() {
      const allPosts = await fetchAllPosts();
      setAllIds(allPosts.map(p => p.id).filter(Boolean));
      const data = allPosts.find(p => p.id === slug);
      if (!data) { setError('Post not found: ' + slug); setLoading(false); return; }

      setOriginalId(data.id);
      setCategory(data.category || 'Jobs');
      setTitle(data.title || '');
      setId(data.id || '');
      setCreatedAt(data.created_at || getTodayDate());
      setOrganization(data.organization || '');
      setTotalVacancy(data.total_vacancy != null ? String(data.total_vacancy) : '');
      setJobLocation(data.job_location || '');
      setShortNote(data.short_note || '');
      setTags(Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : ['']);
      setQualification1(Array.isArray(data.qualification1) && data.qualification1.length > 0 ? data.qualification1 : ['']);

      // Dynamic dates
      if (data.important_dates && typeof data.important_dates === 'object') {
        const arr = Object.entries(data.important_dates).filter(([,v]) => v).map(([key, value]) => ({ key, value }));
        setDates(arr.length > 0 ? arr : [{ key: '', value: '' }]);
      }

      // Links
      if (data.important_links && typeof data.important_links === 'object') {
        const arr = Object.entries(data.important_links).filter(([,v]) => v).map(([name, url]) => ({ name: name.replace(/_/g, ' '), url }));
        setLinks(arr.length > 0 ? arr : [{ name: '', url: '' }]);
      }

      // Category link
      if (data.jobs?.apply_online)                  setCategoryLink(data.jobs.apply_online);
      else if (data.result?.download_result)        setCategoryLink(data.result.download_result);
      else if (data.admit_card?.download_admit_card) setCategoryLink(data.admit_card.download_admit_card);
      else if (data.answer_key?.download_answer_key) setCategoryLink(data.answer_key.download_answer_key);
      else if (data.syllabus?.download_syllabus)    setCategoryLink(data.syllabus.download_syllabus);

      // Video
      if (data.video?.url) { setVideoUrl(data.video.url); setVideoTitle(data.video.title || ''); }

      // type1
      setType1(Array.isArray(data.type1) && data.type1.length > 0
        ? data.type1.map(t => ({ ...t, oneline: Array.isArray(t.oneline) ? t.oneline : [] }))
        : []);
      // type2
      setType2(Array.isArray(data.type2) && data.type2.length > 0
        ? data.type2.map(t => ({ ...t, oneline: Array.isArray(t.oneline) ? t.oneline : [] }))
        : []);
      // type3
      setType3(Array.isArray(data.type3) && data.type3.length > 0
        ? data.type3.map(b => ({ ...b, oneline: Array.isArray(b.oneline) ? b.oneline : [] }))
        : []);

      setLoading(false);
    }
    loadJob();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const checkSlug = useCallback((s) => {
    if (!s || s === originalId) { setSlugStatus('available'); return; }
    setSlugStatus(allIds.includes(s) ? 'taken' : 'available');
  }, [originalId, allIds]);

  useEffect(() => {
    const t = setTimeout(() => checkSlug(id), 400);
    return () => clearTimeout(t);
  }, [id, checkSlug]);

  const updateArr = (setter, i, val) => setter(prev => prev.map((v, j) => j === i ? val : v));
  const addArr    = (setter) => setter(prev => [...prev, '']);
  const removeArr = (setter, i) => setter(prev => prev.filter((_, j) => j !== i));

  const updateDate = (i, f, v) => setDates(prev => prev.map((d, j) => j === i ? { ...d, [f]: v } : d));
  const addDate    = () => setDates(prev => [...prev, { key: '', value: '' }]);
  const removeDate = (i) => setDates(prev => prev.filter((_, j) => j !== i));

  const updateLink = (i, f, v) => setLinks(prev => prev.map((l, j) => j === i ? { ...l, [f]: v } : l));
  const addLink    = () => setLinks(prev => [...prev, { name: '', url: '' }]);
  const removeLink = (i) => setLinks(prev => prev.filter((_, j) => j !== i));

  // Type1
  const addType1          = () => setType1(prev => [...prev, emptyTable()]);
  const removeType1       = (i) => setType1(prev => prev.filter((_, j) => j !== i));
  const updateType1       = (i, f, v) => setType1(prev => prev.map((t, j) => j === i ? { ...t, [f]: v } : t));
  const addType1Row       = (i) => setType1(prev => prev.map((t, j) => j === i ? { ...t, rows: [...t.rows, Array(t.columns.length).fill('')] } : t));
  const removeType1Row    = (ti, ri) => setType1(prev => prev.map((t, j) => j === ti ? { ...t, rows: t.rows.filter((_, k) => k !== ri) } : t));
  const updateType1Row    = (ti, ri, ci, val) => setType1(prev => prev.map((t, j) => j === ti ? { ...t, rows: t.rows.map((r, k) => k === ri ? r.map((c, l) => l === ci ? val : c) : r) } : t));
  const updateType1Col    = (ti, ci, val) => setType1(prev => prev.map((t, j) => j === ti ? { ...t, columns: t.columns.map((c, k) => k === ci ? val : c) } : t));
  const addType1Oneline   = (i) => setType1(prev => prev.map((t, j) => j === i ? { ...t, oneline: [...(t.oneline||[]), ''] } : t));
  const removeType1Oneline= (ti, ii) => setType1(prev => prev.map((t, j) => j === ti ? { ...t, oneline: t.oneline.filter((_, k) => k !== ii) } : t));
  const updateType1Oneline= (ti, ii, v) => setType1(prev => prev.map((t, j) => j === ti ? { ...t, oneline: t.oneline.map((o, k) => k === ii ? v : o) } : t));

  // Type2
  const addType2          = () => setType2(prev => [...prev, emptyTable()]);
  const removeType2       = (i) => setType2(prev => prev.filter((_, j) => j !== i));
  const updateType2       = (i, f, v) => setType2(prev => prev.map((t, j) => j === i ? { ...t, [f]: v } : t));
  const addType2Row       = (i) => setType2(prev => prev.map((t, j) => j === i ? { ...t, rows: [...t.rows, Array(t.columns.length).fill('')] } : t));
  const removeType2Row    = (ti, ri) => setType2(prev => prev.map((t, j) => j === ti ? { ...t, rows: t.rows.filter((_, k) => k !== ri) } : t));
  const updateType2Row    = (ti, ri, ci, val) => setType2(prev => prev.map((t, j) => j === ti ? { ...t, rows: t.rows.map((r, k) => k === ri ? r.map((c, l) => l === ci ? val : c) : r) } : t));
  const updateType2Col    = (ti, ci, val) => setType2(prev => prev.map((t, j) => j === ti ? { ...t, columns: t.columns.map((c, k) => k === ci ? val : c) } : t));
  const addType2Col       = (i) => setType2(prev => prev.map((t, j) => j === i ? { ...t, columns: [...t.columns, ''], rows: t.rows.map(r => [...r, '']) } : t));
  const removeType2Col    = (ti, ci) => setType2(prev => prev.map((t, j) => j === ti ? { ...t, columns: t.columns.filter((_, k) => k !== ci), rows: t.rows.map(r => r.filter((_, k) => k !== ci)) } : t));
  const addType2Oneline   = (i) => setType2(prev => prev.map((t, j) => j === i ? { ...t, oneline: [...(t.oneline||[]), ''] } : t));
  const removeType2Oneline= (ti, ii) => setType2(prev => prev.map((t, j) => j === ti ? { ...t, oneline: t.oneline.filter((_, k) => k !== ii) } : t));
  const updateType2Oneline= (ti, ii, v) => setType2(prev => prev.map((t, j) => j === ti ? { ...t, oneline: t.oneline.map((o, k) => k === ii ? v : o) } : t));

  // Type3
  const addType3          = () => setType3(prev => [...prev, emptyBlock()]);
  const removeType3       = (i) => setType3(prev => prev.filter((_, j) => j !== i));
  const updateType3Title  = (i, v) => setType3(prev => prev.map((b, j) => j === i ? { ...b, title: v } : b));
  const addType3Item      = (i) => setType3(prev => prev.map((b, j) => j === i ? { ...b, content: [...b.content, ''] } : b));
  const removeType3Item   = (bi, ii) => setType3(prev => prev.map((b, j) => j === bi ? { ...b, content: b.content.filter((_, k) => k !== ii) } : b));
  const updateType3Item   = (bi, ii, v) => setType3(prev => prev.map((b, j) => j === bi ? { ...b, content: b.content.map((c, k) => k === ii ? v : c) } : b));
  const addType3Oneline   = (i) => setType3(prev => prev.map((b, j) => j === i ? { ...b, oneline: [...(b.oneline||[]), ''] } : b));
  const removeType3Oneline= (bi, ii) => setType3(prev => prev.map((b, j) => j === bi ? { ...b, oneline: b.oneline.filter((_, k) => k !== ii) } : b));
  const updateType3Oneline= (bi, ii, v) => setType3(prev => prev.map((b, j) => j === bi ? { ...b, oneline: b.oneline.map((o, k) => k === ii ? v : o) } : b));

  const buildData = useCallback(() => {
    const importantDates = {};
    dates.forEach(d => { if (d.key && d.value) importantDates[d.key] = d.value; });
    const importantLinks = {};
    links.forEach(l => { if (l.name && l.url) importantLinks[l.name.toLowerCase().replace(/\s+/g, '_')] = l.url; });
    return {
      id, created_at: createdAt, category, title,
      organization: organization || null,
      total_vacancy: totalVacancy || null,
      job_location: jobLocation || null,
      short_note: shortNote || null,
      tags: tags.filter(Boolean),
      qualification1: qualification1.filter(Boolean),
      important_dates: importantDates,
      important_links: importantLinks,
      video: videoUrl ? { title: videoTitle || '', url: videoUrl } : null,
      jobs:       category === 'Jobs'       && categoryLink ? { apply_online:        categoryLink } : null,
      result:     category === 'result'     && categoryLink ? { download_result:     categoryLink } : null,
      admit_card: category === 'admit-card' && categoryLink ? { download_admit_card: categoryLink } : null,
      answer_key: category === 'answer-key' && categoryLink ? { download_answer_key: categoryLink } : null,
      syllabus:   category === 'syllabus'   && categoryLink ? { download_syllabus:   categoryLink } : null,
      type1: type1.filter(t => t.rows.length > 0).map(t => ({ ...t, oneline: (t.oneline||[]).filter(Boolean) })),
      type2: type2.filter(t => t.rows.length > 0).map(t => ({ ...t, oneline: (t.oneline||[]).filter(Boolean) })),
      type3: type3.filter(b => b.title).map(b => ({ ...b, oneline: (b.oneline||[]).filter(Boolean) })),
    };
  }, [id, createdAt, category, title, organization, totalVacancy, jobLocation, shortNote, tags, qualification1, dates, links, categoryLink, videoTitle, videoUrl, type1, type2, type3]);

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
        <div className={styles.sidebarLogo}><span className={styles.logoText}>Sidhe<span>Naukri</span></span><span className={styles.logoSub}>Admin</span></div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>📊 Dashboard</Link>
          <Link href="/new-post" className={styles.navLink}>✏️ New Post</Link>
          <Link href="/posts" className={`${styles.navLink} ${styles.active}`}>📋 All Posts</Link>
           <Link href="/revalidate" className={styles.navLink}>🔄 Revalidate</Link>
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

            {/* Basic Info */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Basic Information</h2>
              <div className={styles.field}><label>Title *</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className={styles.field}>
                <label>URL (Slug) *
                  {slugStatus==='checking'  && <span className={styles.checking}> ⏳</span>}
                  {slugStatus==='available' && <span className={styles.available}> ✅ Available</span>}
                  {slugStatus==='taken'     && <span className={styles.taken}> ❌ Already taken</span>}
                </label>
                <input value={id} onChange={e => setId(e.target.value)} />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.field}><label>Post Date</label>
                  <input type="date" value={toInputDate(createdAt)} onChange={e => setCreatedAt(fromInputDate(e.target.value))} />
                </div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Organization</label><input value={organization} onChange={e => setOrganization(e.target.value)} /></div>
                <div className={styles.field}><label>Total Vacancy</label><input value={totalVacancy} onChange={e => setTotalVacancy(e.target.value)} /></div>
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
                <label>Qualification</label>
                {qualification1.map((q, i) => (
                  <div key={i} className={styles.inlineRow}>
                    <input value={q} onChange={e => updateArr(setQualification1, i, e.target.value)} placeholder="12th pass / Graduate..." />
                    {qualification1.length > 1 && <button className={styles.removeInlineBtn} onClick={() => removeArr(setQualification1, i)}>✕</button>}
                  </div>
                ))}
                <button className={styles.addBtn} onClick={() => addArr(setQualification1)}>+ Add Qualification</button>
              </div>
              <div className={styles.field}>
                <label>Short Note <span style={{fontWeight:400,color:'#888',fontSize:'0.78rem'}}>(khali = auto generate)</span></label>
                <textarea value={shortNote} onChange={e => setShortNote(e.target.value)} rows={3} style={{width:'100%',padding:'10px 14px',border:'1.5px solid #d0d5e8',borderRadius:'8px',fontFamily:'var(--font-poppins)',fontSize:'0.88rem',resize:'vertical',outline:'none'}} />
              </div>
            </div>

            {/* Category Link */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>{catLinkLabel[category] || 'Main Link'}</h2>
              <div className={styles.field}><label>{catLinkLabel[category]}</label><input value={categoryLink} onChange={e => setCategoryLink(e.target.value)} placeholder="https://..." /></div>
            </div>

            {/* Important Dates — fully dynamic */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Important Dates</h2>
              {dates.map((d, i) => (
                <div key={i} className={styles.dynamicRow}>
                  <div className={styles.field} style={{flex:'0 0 180px'}}>
                    <label>Date Label</label>
                    <input value={d.key} onChange={e => updateDate(i, 'key', e.target.value)} placeholder="last_date / exam_date..." />
                  </div>
                  <div className={styles.field} style={{flex:1}}>
                    <label>Date (DD/MM/YYYY)</label>
                    <input type="date" value={toInputDate(d.value)} onChange={e => updateDate(i, 'value', fromInputDate(e.target.value))} />
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeDate(i)}>✕</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={addDate}>+ Add Date</button>
            </div>

            {/* Important Links */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Important Links</h2>
              {links.map((l, i) => (
                <div key={i} className={styles.dynamicRow}>
                  <div className={styles.field} style={{flex:'0 0 180px'}}><label>Link Name</label><input value={l.name} onChange={e => updateLink(i, 'name', e.target.value)} placeholder="Official Website" /></div>
                  <div className={styles.field} style={{flex:1}}><label>URL</label><input value={l.url} onChange={e => updateLink(i, 'url', e.target.value)} placeholder="https://..." /></div>
                  {links.length > 1 && <button className={styles.removeBtn} onClick={() => removeLink(i)}>✕</button>}
                </div>
              ))}
              <button className={styles.addBtn} onClick={addLink}>+ Add Link</button>
            </div>

            {/* Type1 */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Type1 Tables</h2>
              {type1.map((t, ti) => (
                <div key={ti} className={styles.tableBlock}>
                  <div className={styles.tableBlockHeader}>
                    <input className={styles.tableTitleInput} value={t.title} onChange={e => updateType1(ti, 'title', e.target.value)} placeholder="Table Title" />
                    <button className={styles.removeBtn} onClick={() => removeType1(ti)}>✕ Remove</button>
                  </div>
                  <div className={styles.tableGrid}>
                    <div className={styles.tableHeaderRow}>
                      {t.columns.map((col, ci) => (
                        <div key={ci} className={styles.tableColWrap}>
                          <input className={styles.tableColInput} value={col} onChange={e => updateType1Col(ti, ci, e.target.value)} placeholder={`Col ${ci+1}`} />
                        </div>
                      ))}
                    </div>
                    {t.rows.map((row, ri) => (
                      <div key={ri} className={styles.tableRow}>
                        {row.map((cell, ci) => (
                          <input key={ci} className={styles.tableCellInput} value={cell} onChange={e => updateType1Row(ti, ri, ci, e.target.value)} placeholder={`R${ri+1}C${ci+1}`} />
                        ))}
                        <button className={styles.removeRowBtn} onClick={() => removeType1Row(ti, ri)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <button className={styles.addBtn} style={{marginTop:8}} onClick={() => addType1Row(ti)}>+ Add Row</button>
                  <div className={styles.subLabel} style={{marginTop:12}}>One Line Info</div>
                  {(t.oneline||[]).map((item, ii) => (
                    <div key={ii} className={styles.inlineRow}>
                      <input value={item} onChange={e => updateType1Oneline(ti, ii, e.target.value)} placeholder="Extra info..." />
                      <button className={styles.removeInlineBtn} onClick={() => removeType1Oneline(ti, ii)}>✕</button>
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={() => addType1Oneline(ti)}>+ Add One Line</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={addType1}>+ Add Type1 Table</button>
            </div>

            {/* Type2 */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Type2 Tables</h2>
              {type2.map((t, ti) => (
                <div key={ti} className={styles.tableBlock}>
                  <div className={styles.tableBlockHeader}>
                    <input className={styles.tableTitleInput} value={t.title} onChange={e => updateType2(ti, 'title', e.target.value)} placeholder="Table Title" />
                    <button className={styles.removeBtn} onClick={() => removeType2(ti)}>✕ Remove</button>
                  </div>
                  <div className={styles.tableGrid}>
                    <div className={styles.tableHeaderRow}>
                      {t.columns.map((col, ci) => (
                        <div key={ci} className={styles.tableColWrap}>
                          <input className={styles.tableColInput} value={col} onChange={e => updateType2Col(ti, ci, e.target.value)} placeholder={`Col ${ci+1}`} />
                          {t.columns.length > 1 && <button className={styles.removeColBtn} onClick={() => removeType2Col(ti, ci)}>✕</button>}
                        </div>
                      ))}
                      <button className={styles.addColBtn} onClick={() => addType2Col(ti)}>+ Col</button>
                    </div>
                    {t.rows.map((row, ri) => (
                      <div key={ri} className={styles.tableRow}>
                        {row.map((cell, ci) => (
                          <input key={ci} className={styles.tableCellInput} value={cell} onChange={e => updateType2Row(ti, ri, ci, e.target.value)} placeholder={`R${ri+1}C${ci+1}`} />
                        ))}
                        <button className={styles.removeRowBtn} onClick={() => removeType2Row(ti, ri)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <button className={styles.addBtn} style={{marginTop:8}} onClick={() => addType2Row(ti)}>+ Add Row</button>
                  <div className={styles.subLabel} style={{marginTop:12}}>One Line Info</div>
                  {(t.oneline||[]).map((item, ii) => (
                    <div key={ii} className={styles.inlineRow}>
                      <input value={item} onChange={e => updateType2Oneline(ti, ii, e.target.value)} placeholder="Extra info..." />
                      <button className={styles.removeInlineBtn} onClick={() => removeType2Oneline(ti, ii)}>✕</button>
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={() => addType2Oneline(ti)}>+ Add One Line</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={addType2}>+ Add Type2 Table</button>
            </div>

            {/* Type3 */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Type3 Content Blocks</h2>
              {type3.map((b, bi) => (
                <div key={bi} className={styles.tableBlock}>
                  <div className={styles.tableBlockHeader}>
                    <input className={styles.tableTitleInput} value={b.title} onChange={e => updateType3Title(bi, e.target.value)} placeholder="Block Title" />
                    <button className={styles.removeBtn} onClick={() => removeType3(bi)}>✕ Remove</button>
                  </div>
                  {b.content.map((item, ii) => (
                    <div key={ii} className={styles.inlineRow}>
                      <input value={item} onChange={e => updateType3Item(bi, ii, e.target.value)} placeholder="Bullet point..." />
                      {b.content.length > 1 && <button className={styles.removeInlineBtn} onClick={() => removeType3Item(bi, ii)}>✕</button>}
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={() => addType3Item(bi)}>+ Add Point</button>
                  <div className={styles.subLabel} style={{marginTop:12}}>One Line Info</div>
                  {(b.oneline||[]).map((item, ii) => (
                    <div key={ii} className={styles.inlineRow}>
                      <input value={item} onChange={e => updateType3Oneline(bi, ii, e.target.value)} placeholder="Extra info..." />
                      <button className={styles.removeInlineBtn} onClick={() => removeType3Oneline(bi, ii)}>✕</button>
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={() => addType3Oneline(bi)}>+ Add One Line</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={addType3}>+ Add Type3 Block</button>
            </div>

            {/* Video */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>YouTube Video (Optional)</h2>
              <div className={styles.field}><label>Video Title</label><input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="SSC GD 2026 Full Guide" /></div>
              <div className={styles.field}><label>YouTube URL</label><input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
            </div>

            <div style={{display:'flex',justifyContent:'flex-end',paddingBottom:32}}>
              <button className={styles.copyBtn} onClick={handleCopyJson} disabled={slugStatus==='taken'} style={{fontSize:'1rem',padding:'13px 32px'}}>
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