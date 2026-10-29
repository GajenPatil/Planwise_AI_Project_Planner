import { useMemo, useState } from 'react'
import './App.css'

const example = 'Build a project planning web app for small product teams. Users can paste a product idea, generate milestones and tasks with effort estimates, and review dependencies. Use React and FastAPI. The first version should support desktop and mobile layouts.'

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'spark') return <svg {...common}><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z"/></svg>
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>
  return <svg {...common}><path d="M4 5h16v14H4zM8 3v4m8-4v4M4 10h16"/></svg>
}

function App() {
  const [requirements, setRequirements] = useState('')
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const tasks = useMemo(() => plan?.milestones?.flatMap((milestone) => milestone.tasks ?? []) ?? [], [plan])

  async function generatePlan(event) {
    event.preventDefault()
    if (!requirements.trim() || loading) return
    setLoading(true)
    setError('')
    setPlan(null)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'}/api/generate-plan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requirements: requirements.trim() }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.detail || 'Could not generate a plan. Please try again.')
      setPlan(body)
    } catch (requestError) {
      setError(requestError.message || 'Could not reach the planning API. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Planwise home"><span className="brand-mark"><Icon name="spark" size={20} /></span><span>planwise<span className="brand-period">.</span></span></a>
        <div className="topbar-right"><span className="status-dot" /> AI project planner <span className="topbar-divider" /> <span className="version">BETA</span></div>
      </header>

      <main id="top">
        <section className="intro">
          <div className="eyebrow"><span className="eyebrow-line" /> FROM IDEA TO ACTION</div>
          <h1>Make the plan.<br /><span>Make it happen.</span></h1>
          <p className="intro-copy">Turn your project requirements into a clear, actionable roadmap in seconds.</p>
        </section>

        <section className="planner-grid" aria-label="Project planner">
          <form className="input-card" onSubmit={generatePlan}>
            <div className="card-heading"><div><span className="step-label">01 / YOUR PROJECT</span><h2>What are you building?</h2></div><span className="heading-icon"><Icon name="spark" /></span></div>
            <label className="sr-only" htmlFor="requirements">Project requirements</label>
            <textarea id="requirements" maxLength={20000} value={requirements} onChange={(event) => setRequirements(event.target.value)} placeholder="Describe your project, goals, key features, team or timeline constraints…" />
            <div className="input-meta"><button className="example-button" type="button" onClick={() => setRequirements(example)}>Try an example <Icon name="arrow" size={14} /></button><span>{requirements.length.toLocaleString()} / 20,000</span></div>
            {error && <div className="error-message" role="alert">{error}</div>}
            <button className="generate-button" type="submit" disabled={!requirements.trim() || loading}>
              {loading ? <><span className="spinner" /> Building your roadmap</> : <>Generate project plan <Icon name="arrow" /></>}
            </button>
            <p className="privacy-note">Your requirements are only used to generate this plan.</p>
          </form>

          <aside className="how-card">
            <div className="how-title"><span className="step-label">THE OUTPUT</span><span className="sparkle-small"><Icon name="spark" size={16} /></span></div>
            <h2>A thoughtful plan,<br />ready to get moving.</h2>
            <div className="output-list">
              <div className="output-item"><span className="output-icon violet"><Icon name="calendar" size={17} /></span><span><b>Milestones</b><small>Clear phases from kickoff to launch</small></span><Icon name="check" size={16} /></div>
              <div className="output-item"><span className="output-icon peach"><Icon name="check" size={17} /></span><span><b>Actionable tasks</b><small>Specific work, organized by phase</small></span><Icon name="check" size={16} /></div>
              <div className="output-item"><span className="output-icon mint"><Icon name="clock" size={17} /></span><span><b>Effort estimates</b><small>Hours and dependencies for each task</small></span><Icon name="check" size={16} /></div>
            </div>
            <div className="how-foot"><span className="mini-avatars"><i>R</i><i>✳</i><i>✓</i></span><span>Less guessing. More making.</span></div>
          </aside>
        </section>

        {plan && <section className="results" aria-live="polite">
          <div className="results-header"><div><span className="step-label">02 / YOUR ROADMAP</span><h2>{plan.project_title}</h2></div><div className="summary-pills"><span><Icon name="calendar" size={15} /> {plan.milestones.length} milestones</span><span><Icon name="check" size={15} /> {tasks.length} tasks</span><span><Icon name="clock" size={15} /> {plan.total_estimated_hours} hrs total</span></div></div>
          <div className="milestone-grid">{plan.milestones.map((milestone, index) => <article className="milestone-card" key={`${milestone.milestone_name}-${index}`}><div className="milestone-top"><span className="milestone-number">{String(index + 1).padStart(2, '0')}</span><span className="milestone-hours">{milestone.tasks.reduce((sum, task) => sum + task.effort_hours, 0)} hrs</span></div><h3>{milestone.milestone_name}</h3><div className="task-list">{milestone.tasks.map((task, taskIndex) => <div className="task-row" key={`${task.task_name}-${taskIndex}`}><span className="task-bullet" /><div className="task-content"><b>{task.task_name}</b><p>{task.description}</p>{task.dependencies?.length > 0 && <small className="dependency">Depends on: {task.dependencies.join(', ')}</small>}</div><span className="task-effort">{task.effort_hours}h</span></div>)}</div></article>)}</div>
        </section>}

        {!plan && !loading && <div className="bottom-note"><span className="note-star">✳</span> Good plans leave room for good ideas.</div>}
      </main>
      <footer><span>PLANWISE <span className="brand-period">●</span> PROJECT PLANNING AGENT</span><span>Built for the work ahead.</span></footer>
    </div>
  )
}

export default App
