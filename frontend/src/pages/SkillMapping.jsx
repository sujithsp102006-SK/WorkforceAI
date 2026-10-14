
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const css = `
.sm-page{--bg:#050b1c;--panel:#0b1530;--line:#203d70;--muted:#9db3d9;--text:#eef5ff;--cyan:#35d9ff;color:var(--text);min-height:100%;padding:26px;background:radial-gradient(ellipse at 70% 0%,#172657 0%,transparent 36%),radial-gradient(ellipse at 0% 60%,#102b54 0%,transparent 30%),var(--bg);font-family:Inter,system-ui,sans-serif}
.sm-page *{box-sizing:border-box}.sm-page button,.sm-page input,.sm-page select{font:inherit}.sm-page button{cursor:pointer}
.sm-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}.sm-titlewrap{display:flex;align-items:center;gap:15px}.sm-orb{display:grid;place-items:center;width:52px;height:52px;border-radius:17px;background:linear-gradient(135deg,#0878ff33,#a855f733);border:1px solid #467fff;box-shadow:0 0 24px #2e8fff30;font-size:28px}.sm-title{font-size:clamp(23px,3vw,31px);font-weight:800;letter-spacing:-.8px;margin:0}.sm-sub{margin:5px 0 0;color:var(--muted);font-size:13px}.sm-live{display:flex;align-items:center;gap:8px;border:1px solid #1f6b75;background:#062d3a88;color:#7af3e1;border-radius:999px;padding:8px 12px;font-size:11px;font-weight:800;letter-spacing:1px}.sm-dot{width:7px;height:7px;border-radius:50%;background:#34e5bf;box-shadow:0 0 12px #34e5bf}
.sm-panel{background:linear-gradient(145deg,#0d1935f2,#081229f5);border:1px solid var(--line);border-radius:18px;box-shadow:0 12px 36px #0003;min-width:0}.sm-config{padding:20px;border-color:#3964a8}.sm-confighead{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:16px}.sm-kicker{color:#69cfff;font-size:10px;font-weight:800;letter-spacing:1.7px;text-transform:uppercase}.sm-configgrid{display:grid;grid-template-columns:1fr 1fr 1.2fr auto;gap:14px;align-items:end}.sm-field label{display:block;font-size:12px;color:#c8d8f4;font-weight:700;margin-bottom:8px}.sm-field select,.sm-field input{width:100%;min-width:0;color:#eaf3ff;background:#071127;border:1px solid #294774;border-radius:10px;padding:12px 13px;outline:none;font-size:12px}.sm-field select:focus,.sm-field input:focus{border-color:#35cfff;box-shadow:0 0 0 3px #35cfff1b}.sm-help{font-size:10px;color:#819ac2;margin-top:7px}.sm-btn{border:0;border-radius:11px;padding:13px 18px;color:white;font-size:12px;font-weight:800;background:linear-gradient(105deg,#08bce9,#287dff 55%,#a43dff);box-shadow:0 0 22px #178eff45;white-space:nowrap;transition:transform .2s}.sm-btn:hover{transform:translateY(-1px)}.sm-btn:disabled{opacity:.65;cursor:wait}.sm-btn.secondary{background:#14264a;border:1px solid #31558a;box-shadow:none}
.sm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:16px 0}.sm-stat{padding:18px;display:flex;align-items:center;gap:14px;min-height:110px}.sm-stat-icon{flex:0 0 48px;width:48px;height:48px;display:grid;place-items:center;border-radius:15px;font-size:22px;background:#12375a;border:1px solid #2269a4}.sm-stat-icon.violet{background:#32164e;border-color:#713ca3}.sm-stat-icon.amber{background:#3b2a16;border-color:#8e6427}.sm-stat-icon.green{background:#073e3a;border-color:#1d8a7b}.sm-stat-label{font-size:11px;color:#a9bfdf;margin-bottom:6px}.sm-stat-value{font-size:26px;font-weight:850;line-height:1.05}.sm-stat-note{font-size:10px;color:#7893bd;margin-top:6px}
.sm-main-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:15px}.sm-section{padding:19px}.sm-section-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:17px;padding-bottom:13px;border-bottom:1px solid #1d3155}.sm-section-title{font-size:15px;font-weight:800;margin:0;display:flex;align-items:center;gap:9px}.sm-section-title span{color:var(--cyan)}.sm-legend{font-size:10px;color:#93acd2;display:flex;gap:12px}.sm-key{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:5px;background:#29bfff}.sm-key.v{background:#b36bff}.sm-bars{display:flex;flex-direction:column;gap:17px}.sm-barrow{display:grid;grid-template-columns:112px minmax(0,1fr) 70px;gap:10px;align-items:center}.sm-barname{font-size:11px;color:#dbe8ff;overflow-wrap:anywhere}.sm-track{height:11px;background:#14264a;border-radius:99px;overflow:hidden}.sm-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#148bff,#3be0ff);box-shadow:0 0 12px #19b8ff3b}.sm-fill.low{background:linear-gradient(90deg,#8b42ff,#e052ff)}.sm-barvalue{text-align:right;font-size:10px;color:#73dfff}.sm-empty{padding:24px;text-align:center;border:1px dashed #28446e;border-radius:12px;color:#9ab0d2;font-size:12px}
.sm-gaplist{display:flex;flex-direction:column}.sm-gap{display:grid;grid-template-columns:25px minmax(95px,1fr) auto minmax(105px,1.2fr);align-items:center;gap:9px;padding:11px 0;border-bottom:1px solid #1a2c4b}.sm-gap:last-child{border-bottom:0}.sm-rank{width:23px;height:23px;border-radius:50%;display:grid;place-items:center;background:#50202d;color:#ff8b9d;font-size:10px;font-weight:800}.sm-rank.medium{background:#493519;color:#ffd078}.sm-rank.low{background:#17344d;color:#9fc9ff}.sm-gapname{font-size:11px;font-weight:700}.sm-priority{font-size:9px;font-weight:800;border-radius:5px;padding:4px 6px;background:#4b1d2a;color:#ff8a9c;white-space:nowrap}.sm-priority.medium{background:#453116;color:#ffce74}.sm-priority.low{background:#103a3c;color:#72eadb}.sm-gapreason{font-size:10px;color:#8da5cc;line-height:1.45}
.sm-roadmap{margin-top:15px;padding:20px}.sm-roadmap-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:17px}.sm-roadmap-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.sm-stage{padding:15px;border:1px solid #31507e;border-radius:14px;background:linear-gradient(160deg,#111f40,#09152b);display:flex;flex-direction:column;min-width:0}.sm-stage.s1{border-color:#a54259}.sm-stage.s2{border-color:#137eaf}.sm-stage.s3{border-color:#7950c2}.sm-stage.s4{border-color:#168a7b}.sm-stage-top{display:flex;justify-content:space-between;align-items:center;gap:5px;font-size:10px;color:#9db7df}.sm-duration{border-radius:99px;border:1px solid #42638f;padding:4px 7px;white-space:nowrap;font-size:9px}.sm-stage h4{font-size:14px;margin:13px 0 12px}.sm-stage ul{list-style:none;padding:0;margin:0 0 15px;display:flex;flex-direction:column;gap:10px;flex:1}.sm-stage li{font-size:10px;color:#b9cce9;display:flex;gap:8px;line-height:1.4}.sm-stage li:before{content:'○';color:#43dcff;font-size:14px;line-height:10px}.sm-stage.s1 li:before{color:#ff718b}.sm-stage.s3 li:before{color:#c28aff}.sm-stage.s4 li:before{color:#36e0b5}.sm-stage .sm-btn{padding:10px 8px;font-size:10px;background:#126fc4}.sm-stage.s1 .sm-btn{background:linear-gradient(90deg,#e8495b,#f06b75)}.sm-stage.s2 .sm-btn{background:linear-gradient(90deg,#0877cb,#00a8df)}.sm-stage.s3 .sm-btn{background:linear-gradient(90deg,#6528d7,#9c42ef)}.sm-stage.s4 .sm-btn{background:linear-gradient(90deg,#0ba888,#32d5a9)}
.sm-alert{margin-top:14px;padding:12px 14px;border-radius:10px;border:1px solid #7b3546;background:#301321;color:#ffb6c1;font-size:12px}.sm-footnote{font-size:10px;color:#718bb4;margin-top:13px;line-height:1.5}.sm-emptyresult{padding:28px;text-align:center;color:#9db3d9;font-size:12px}.sm-spinner{display:inline-block;width:13px;height:13px;border:2px solid #ffffff55;border-top-color:white;border-radius:50%;animation:smspin .7s linear infinite;vertical-align:middle;margin-right:7px}@keyframes smspin{to{transform:rotate(360deg)}}@media(max-width:1100px){.sm-configgrid{grid-template-columns:1fr 1fr}.sm-configgrid .sm-btn{width:100%}.sm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sm-roadmap-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sm-gap{grid-template-columns:25px minmax(80px,1fr) auto}.sm-gapreason{grid-column:2/-1;margin-top:-4px}}@media(max-width:760px){.sm-page{padding:15px}.sm-head{align-items:flex-start}.sm-live{display:none}.sm-configgrid,.sm-main-grid{grid-template-columns:1fr}.sm-stat{padding:14px}.sm-stat-value{font-size:23px}.sm-section{padding:14px}.sm-barrow{grid-template-columns:86px minmax(0,1fr) 60px;gap:7px}.sm-roadmap-grid{grid-template-columns:1fr}.sm-roadmap-head{align-items:flex-start;flex-direction:column}.sm-gap{grid-template-columns:25px minmax(80px,1fr) auto}.sm-gapreason{grid-column:2/-1}.sm-title{font-size:23px}}
`;

function StatCard({ icon, label, value, note, tone = '' }) {
  return (
    <div className="sm-panel sm-stat">
      <div className={`sm-stat-icon ${tone}`}>{icon}</div>
      <div>
        <div className="sm-stat-label">{label}</div>
        <div className="sm-stat-value">{value}</div>
        <div className="sm-stat-note">{note}</div>
      </div>
    </div>
  );
}

const priorityClass = (priority) => {
  const value = String(priority || 'MEDIUM').toUpperCase();
  return value === 'HIGH' ? 'high' : value === 'LOW' ? 'low' : 'medium';
};

export default function SkillMapping({ onNavigate, onOpenRecommendations }) {
  const [employees, setEmployees] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [currentSkillsInput, setCurrentSkillsInput] = useState('Java, SQL, HTML');
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [mappingResult, setMappingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const calculateMapping = useCallback(async (skillsText = currentSkillsInput, role = targetRole) => {
    try {
      setLoading(true);
      setError(null);
      const currentSkills = skillsText.split(',').map((skill) => skill.trim()).filter(Boolean);
      const response = await api.recommendSkills({ currentSkills, targetRole: role });
      if (response?.success && response.data) {
        setMappingResult(response.data);
      } else {
        setMappingResult(null);
        setError(response?.message || 'No skill analysis result returned. Please try again.');
      }
    } catch (err) {
      console.error('Skill mapping error:', err);
      setError('Skill analysis failed. Check that the backend is running, then retry.');
    } finally {
      setLoading(false);
    }
  }, [currentSkillsInput, targetRole]);

  useEffect(() => {
    let active = true;
    async function initData() {
      try {
        const [employeeResponse, catalogResponse] = await Promise.all([
          api.getEmployees(),
          api.getRolesCatalog(),
        ]);
        if (!active) return;
        if (employeeResponse?.success && Array.isArray(employeeResponse.data)) {
          setEmployees(employeeResponse.data);
          if (employeeResponse.data.length) {
            const first = employeeResponse.data[0];
            setSelectedEmployeeId(first.employeeId || first._id || '');
            setCurrentSkillsInput(first.skills?.join(', ') || 'Java, SQL, HTML');
            setTargetRole(first.targetRole || 'Data Analyst');
          }
        }
        if (catalogResponse?.success) {
          setAvailableRoles(Array.isArray(catalogResponse.roles) ? catalogResponse.roles : []);
        }
      } catch (err) {
        console.warn('Init skill mapping failed:', err);
      } finally {
        if (active) setInitialized(true);
      }
    }
    initData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (initialized && targetRole) calculateMapping(currentSkillsInput, targetRole);
  }, [initialized, targetRole, currentSkillsInput, calculateMapping]);

  const handleSelectEmployee = (event) => {
    const id = event.target.value;
    setSelectedEmployeeId(id);
    const employee = employees.find((item) => (item.employeeId || item._id) === id);
    if (employee) {
      setCurrentSkillsInput(employee.skills?.join(', ') || '');
      if (employee.targetRole) setTargetRole(employee.targetRole);
    }
  };

  const result = mappingResult || {};
  const requiredSkills = Array.isArray(result.requiredSkills) ? result.requiredSkills : [];
  const matchedSkills = Array.isArray(result.matchedSkills) ? result.matchedSkills : [];
  const missingSkills = Array.isArray(result.missingSkills) ? result.missingSkills : [];
  const learning = Array.isArray(result.recommendedLearning) ? result.recommendedLearning : [];
  const match = Math.max(0, Math.min(100, Number(result.matchPercentage) || 0));

  const openRecommendations = () => {
    if (typeof onOpenRecommendations === 'function') {
      onOpenRecommendations(selectedEmployeeId, targetRole);
    } else if (typeof onNavigate === 'function') {
      onNavigate('recommendations');
    }
  };

  return (
    <div className="sm-page">
      <style>{css}</style>
      <header className="sm-head">
        <div className="sm-titlewrap">
          <div className="sm-orb">◎</div>
          <div>
            <h1 className="sm-title">Skill Mapping</h1>
            <p className="sm-sub">AI-powered skill-gap analysis with a personalized learning roadmap</p>
          </div>
        </div>
        <div className="sm-live"><span className="sm-dot" /> WORKFORCE INTELLIGENCE</div>
      </header>

      <section className="sm-panel sm-config">
        <div className="sm-confighead">
          <div>
            <div className="sm-kicker">✦ Configure analysis</div>
            <div style={{ fontSize: 13, fontWeight: 750, marginTop: 5 }}>Build your next-role readiness profile</div>
          </div>
          <div style={{ color: '#7897c8', fontSize: 11 }}>01 / INPUTS</div>
        </div>
        <div className="sm-configgrid">
          <div className="sm-field">
            <label htmlFor="sm-employee">♙ Select employee</label>
            <select id="sm-employee" value={selectedEmployeeId} onChange={handleSelectEmployee}>
              <option value="">Custom skill profile</option>
              {employees.map((employee) => (
                <option key={employee.employeeId || employee._id} value={employee.employeeId || employee._id}>
                  {employee.name} ({employee.jobRole || 'Employee'} - {employee.employeeId || employee._id})
                </option>
              ))}
            </select>
            <div className="sm-help">Choose a workforce profile to assess</div>
          </div>

          <div className="sm-field">
            <label htmlFor="sm-role">◎ Target job role</label>
            <select id="sm-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)}>
              {availableRoles.map((role) => <option key={role} value={role}>{role}</option>)}
              {!availableRoles.includes(targetRole) && <option value={targetRole}>{targetRole}</option>}
            </select>
            <div className="sm-help">Role you want to grow into</div>
          </div>

          <div className="sm-field">
            <label htmlFor="sm-skills">⌘ Current skills</label>
            <input id="sm-skills" value={currentSkillsInput} onChange={(event) => setCurrentSkillsInput(event.target.value)} placeholder="Python, SQL, Excel..." />
            <div className="sm-help">Separate each skill with a comma</div>
          </div>

          <button className="sm-btn" onClick={() => calculateMapping()} disabled={loading}>
            {loading ? <><span className="sm-spinner" />Analyzing...</> : '✦ Run AI Skill Analysis'}
          </button>
        </div>
      </section>

      {error && <div className="sm-alert" role="alert">⚠ {error}</div>}

      <section className="sm-stats">
        <StatCard icon="◉" label="SKILL MATCH" value={`${match}%`} note="Required competencies matched" />
        <StatCard icon="✧" tone="amber" label="SKILL GAPS" value={missingSkills.length} note="Skills to develop" />
        <StatCard icon="▥" tone="green" label="MATCHED SKILLS" value={matchedSkills.length} note="Current strengths identified" />
        <StatCard icon="✦" tone="violet" label="LEARNING MODULES" value={learning.length} note="Suggested development steps" />
      </section>

      <div className="sm-main-grid">
        <section className="sm-panel sm-section">
          <div className="sm-section-head">
            <h2 className="sm-section-title"><span>▥</span> Competency alignment</h2>
            <div className="sm-legend"><span><i className="sm-key" />Your skills</span><span><i className="sm-key v" />Gaps</span></div>
          </div>
          {loading && !mappingResult ? <div className="sm-empty">Analyzing role requirements...</div> : requiredSkills.length ? (
            <div className="sm-bars">
              {requiredSkills.map((skill) => {
                const normalized = String(skill).toLowerCase();
                const isMatched = matchedSkills.some((item) => String(item).toLowerCase() === normalized);
                const isMissing = missingSkills.some((item) => String(item).toLowerCase() === normalized);
                const percent = isMatched ? 100 : isMissing ? 28 : 55;
                return (
                  <div className="sm-barrow" key={skill}>
                    <div className="sm-barname">{skill}</div>
                    <div className="sm-track"><div className={`sm-fill ${isMissing ? 'low' : ''}`} style={{ width: `${percent}%` }} /></div>
                    <div className="sm-barvalue">{isMatched ? 'MATCHED' : isMissing ? 'GAP' : 'PARTIAL'}</div>
                  </div>
                );
              })}
            </div>
          ) : <div className="sm-empty">Run the analysis to see the competency breakdown.</div>}
          <div className="sm-footnote">Skill indicators are generated from the configured role catalogue and the skills entered above.</div>
        </section>

        <section className="sm-panel sm-section">
          <div className="sm-section-head">
            <h2 className="sm-section-title"><span style={{ color: '#ff718a' }}>◎</span> Priority skill gaps</h2>
            <span style={{ color: '#ff879c', fontSize: 10, border: '1px solid #713246', background: '#301321', borderRadius: 99, padding: '5px 9px' }}>{missingSkills.length} to learn</span>
          </div>
          {missingSkills.length ? (
            <div className="sm-gaplist">
              {missingSkills.map((skill, index) => {
                const item = learning.find((entry) => String(entry.skill).toLowerCase() === String(skill).toLowerCase());
                const priority = item?.priority || (index < 2 ? 'HIGH' : index < 5 ? 'MEDIUM' : 'LOW');
                return (
                  <div className="sm-gap" key={skill}>
                    <div className={`sm-rank ${priorityClass(priority)}`}>{index + 1}</div>
                    <div className="sm-gapname">{skill}</div>
                    <span className={`sm-priority ${priorityClass(priority)}`}>{priority} PRIORITY</span>
                    <div className="sm-gapreason">{item?.recommendedCourses?.[0] || 'Recommended for the selected target role'}</div>
                  </div>
                );
              })}
            </div>
          ) : <div className="sm-empty">{mappingResult ? 'No skill gaps detected for this role.' : 'Your identified skill gaps will appear here.'}</div>}
        </section>
      </div>

      <section className="sm-panel sm-roadmap">
        <div className="sm-roadmap-head">
          <div>
            <div className="sm-section-title"><span style={{ color: '#39d8ff' }}>⌘</span> Personalized learning roadmap</div>
            <p className="sm-sub">A structured path to improve readiness for <strong style={{ color: '#d8e7ff' }}>{targetRole}</strong></p>
          </div>
          <button className="sm-btn secondary" onClick={openRecommendations}>Explore live courses & jobs ↗</button>
        </div>

        {learning.length ? (
          <div className="sm-roadmap-grid">
            {[
              { title: 'Core foundations', duration: 'Stage 01', cls: 's1', items: learning.slice(0, Math.ceil(learning.length / 4)) },
              { title: 'Advanced skills', duration: 'Stage 02', cls: 's2', items: learning.slice(Math.ceil(learning.length / 4), Math.ceil(learning.length / 2)) },
              { title: 'Industry tools', duration: 'Stage 03', cls: 's3', items: learning.slice(Math.ceil(learning.length / 2), Math.ceil(learning.length * 3 / 4)) },
              { title: 'Certification & projects', duration: 'Stage 04', cls: 's4', items: learning.slice(Math.ceil(learning.length * 3 / 4)) },
            ].map((stage) => (
              <div className={`sm-stage ${stage.cls}`} key={stage.cls}>
                <div className="sm-stage-top"><span>{stage.duration}</span><span className="sm-duration">{stage.items.length} module{stage.items.length === 1 ? '' : 's'}</span></div>
                <h4>{stage.title}</h4>
                <ul>
                  {stage.items.length ? stage.items.map((item, index) => <li key={`${item.skill}-${index}`}>{item.skill} · {item.estimatedWeeks || 1} week(s)</li>) : <li>Continue with guided practice and a hands-on project</li>}
                </ul>
                <button className="sm-btn" onClick={openRecommendations}>Find learning resources ↗</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="sm-emptyresult">
            <div style={{ fontSize: 28, marginBottom: 8 }}>✧</div>
            {loading ? 'Building your personalized roadmap...' : 'Run AI Skill Analysis to generate tailored learning modules.'}
          </div>
        )}
        {learning.length > 0 && <div className="sm-footnote">Estimated durations are guidance from the skill-mapping engine, not guaranteed completion times. Prioritize practice projects alongside courses.</div>}
      </section>
    </div>
  );
}
