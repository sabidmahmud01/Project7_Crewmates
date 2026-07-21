import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  createCrewmate,
  deleteCrewmate,
  getCrewmate,
  getCrewmates,
  updateCrewmate,
} from './services/crewmateService';
import { isSupabaseConfigured } from './lib/supabaseClient';

const roles = {
  Strategist: ['Map Sense', 'Fast Planner', 'Risk Reader'],
  Engineer: ['Quick Fix', 'Shield Builder', 'System Tuner'],
  Scout: ['Silent Step', 'Long Vision', 'Signal Boost'],
  Medic: ['Rapid Heal', 'Calm Aura', 'Recovery Kit'],
};

const colors = ['Crimson', 'Cobalt', 'Emerald', 'Gold', 'Violet', 'Slate'];
const traits = ['Bold', 'Patient', 'Curious', 'Focused', 'Playful', 'Steady'];

const defaultCrewmate = {
  name: '',
  role: 'Strategist',
  color: 'Crimson',
  power: roles.Strategist[0],
  trait: 'Bold',
  notes: '',
};

function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-mark">CF</span>
          <span>
            <strong>CrewForge</strong>
            <small>Build a balanced game squad</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/create">Create</NavLink>
          <NavLink to="/crewmates">Crew Gallery</NavLink>
        </nav>
        <p className="storage-note">
          {isSupabaseConfigured ? 'Connected to Supabase' : 'Demo mode: saved in this browser'}
        </p>
      </aside>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateCrewmate />} />
          <Route path="/crewmates" element={<CrewmateGallery />} />
          <Route path="/crewmates/:id" element={<CrewmateDetails />} />
          <Route path="/edit/:id" element={<EditCrewmate />} />
        </Routes>
      </main>
    </div>
  );
}

function Dashboard() {
  const [crewmates, setCrewmates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getCrewmates().then(setCrewmates).catch(() => setError('The crew could not be loaded.'));
  }, []);

  const stats = useMemo(() => buildStats(crewmates), [crewmates]);

  return (
    <section className="screen dashboard-screen">
      <div className="intro">
        <div>
          <p className="eyebrow">Project 7 Crewmates</p>
          <h1>Assemble a squad that can handle anything.</h1>
          <p>
            Create custom crewmates, assign their role, pick attributes, and keep a live
            roster sorted by the newest recruit.
          </p>
        </div>
        <Link className="primary-action" to="/create">Create crewmate</Link>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stats-grid">
        <Stat label="Crew size" value={crewmates.length} />
        <Stat label="Most common role" value={stats.topRole} />
        <Stat label="Crew success" value={`${stats.success}%`} />
      </div>

      <section className={`success-band ${stats.success >= 75 ? 'strong' : ''}`}>
        <div>
          <h2>Mission readiness</h2>
          <p>{stats.message}</p>
        </div>
        <span>{stats.success}%</span>
      </section>

      <CrewmateList crewmates={crewmates.slice(0, 4)} emptyMessage="No crewmates yet." />
    </section>
  );
}

function CreateCrewmate() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    const created = await createCrewmate(formData);
    navigate(`/crewmates/${created.id}`);
  };

  return (
    <section className="screen">
      <PageHeader title="Create a crewmate" subtitle="Choose a role first to unlock matching power options." />
      <CrewmateForm submitLabel="Add to crew" onSubmit={handleSubmit} />
    </section>
  );
}

function CrewmateGallery() {
  const [crewmates, setCrewmates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getCrewmates().then(setCrewmates).catch(() => setError('The crew could not be loaded.'));
  }, []);

  return (
    <section className="screen">
      <PageHeader title="Crew Gallery" subtitle="Newest crewmates appear first." action={<Link className="secondary-action" to="/create">New crewmate</Link>} />
      {error && <p className="error">{error}</p>}
      <CrewmateList crewmates={crewmates} emptyMessage="Your gallery is empty. Create your first crewmate." />
    </section>
  );
}

function CrewmateDetails() {
  const { id } = useParams();
  const [crewmate, setCrewmate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCrewmate(id)
      .then((data) => {
        if (!data) setError('That crewmate was not found.');
        setCrewmate(data);
      })
      .catch(() => setError('That crewmate could not be loaded.'));
  }, [id]);

  if (error) return <MessageScreen message={error} />;
  if (!crewmate) return <MessageScreen message="Loading crewmate..." />;

  return (
    <section className="screen details-screen">
      <Link className="back-link" to="/crewmates">Back to gallery</Link>
      <article className="details-card">
        <div className={`avatar ${crewmate.color.toLowerCase()}`}>{crewmate.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <p className="eyebrow">{crewmate.role}</p>
          <h1>{crewmate.name}</h1>
          <p>
            {crewmate.name} brings {crewmate.power.toLowerCase()} to the squad with a
            {` ${crewmate.trait.toLowerCase()}`} approach.
          </p>
          <dl>
            <div><dt>Color</dt><dd>{crewmate.color}</dd></div>
            <div><dt>Power</dt><dd>{crewmate.power}</dd></div>
            <div><dt>Trait</dt><dd>{crewmate.trait}</dd></div>
            <div><dt>Created</dt><dd>{new Date(crewmate.created_at).toLocaleString()}</dd></div>
          </dl>
          {crewmate.notes && <p className="notes">{crewmate.notes}</p>}
          <Link className="primary-action" to={`/edit/${crewmate.id}`}>Edit crewmate</Link>
        </div>
      </article>
    </section>
  );
}

function EditCrewmate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crewmate, setCrewmate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCrewmate(id)
      .then((data) => {
        if (!data) setError('That crewmate was not found.');
        setCrewmate(data);
      })
      .catch(() => setError('That crewmate could not be loaded.'));
  }, [id]);

  const handleSubmit = async (formData) => {
    const updated = await updateCrewmate(id, formData);
    setCrewmate(updated);
    navigate('/crewmates');
  };

  const handleDelete = async () => {
    await deleteCrewmate(id);
    navigate('/crewmates');
  };

  if (error) return <MessageScreen message={error} />;
  if (!crewmate) return <MessageScreen message="Loading edit form..." />;

  return (
    <section className="screen">
      <PageHeader title={`Edit ${crewmate.name}`} subtitle="Update attributes or remove this crewmate from the squad." />
      <CrewmateForm initialCrewmate={crewmate} submitLabel="Save changes" onSubmit={handleSubmit} onDelete={handleDelete} />
    </section>
  );
}

function CrewmateForm({ initialCrewmate = defaultCrewmate, submitLabel, onSubmit, onDelete }) {
  const [formData, setFormData] = useState(() => ({ ...defaultCrewmate, ...initialCrewmate }));
  const [error, setError] = useState('');

  const rolePowers = roles[formData.role];

  const updateField = (field, value) => {
    setFormData((current) => {
      const next = { ...current, [field]: value };
      if (field === 'role') next.power = roles[value][0];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Give your crewmate a name first.');
      return;
    }

    try {
      await onSubmit({ ...formData, name: formData.name.trim() });
    } catch {
      setError('This crewmate could not be saved.');
    }
  };

  return (
    <form className="crewmate-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <label className="field">
        <span>Name</span>
        <input value={formData.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Nova" />
      </label>

      <OptionGroup label="Role" value={formData.role} options={Object.keys(roles)} onChange={(value) => updateField('role', value)} />
      <OptionGroup label="Power" value={formData.power} options={rolePowers} onChange={(value) => updateField('power', value)} />
      <OptionGroup label="Color" value={formData.color} options={colors} onChange={(value) => updateField('color', value)} />
      <OptionGroup label="Trait" value={formData.trait} options={traits} onChange={(value) => updateField('trait', value)} />

      <label className="field">
        <span>Extra notes</span>
        <textarea value={formData.notes || ''} onChange={(event) => updateField('notes', event.target.value)} placeholder="What makes this crewmate useful?" />
      </label>

      <div className="form-actions">
        <button className="primary-action" type="submit">{submitLabel}</button>
        {onDelete && <button className="danger-action" type="button" onClick={onDelete}>Delete crewmate</button>}
      </div>
    </form>
  );
}

function OptionGroup({ label, value, options, onChange }) {
  return (
    <fieldset className="option-group">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <label key={option} className={value === option ? 'selected' : ''}>
            <input type="radio" name={label} value={option} checked={value === option} onChange={() => onChange(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CrewmateList({ crewmates, emptyMessage }) {
  if (!crewmates.length) {
    return (
      <div className="empty-state">
        <h2>{emptyMessage}</h2>
        <Link className="primary-action" to="/create">Create crewmate</Link>
      </div>
    );
  }

  return (
    <div className="crew-grid">
      {crewmates.map((crewmate) => (
        <article className="crew-card" key={crewmate.id}>
          <Link to={`/crewmates/${crewmate.id}`} className="card-link" aria-label={`View details for ${crewmate.name}`}>
            <div className={`avatar ${crewmate.color.toLowerCase()}`}>{crewmate.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="eyebrow">{crewmate.role}</p>
              <h2>{crewmate.name}</h2>
              <p>{crewmate.power} with a {crewmate.trait.toLowerCase()} style.</p>
            </div>
          </Link>
          <Link className="edit-link" to={`/edit/${crewmate.id}`}>Edit</Link>
        </article>
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">CrewForge</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

function MessageScreen({ message }) {
  return (
    <section className="screen">
      <div className="empty-state">
        <h1>{message}</h1>
        <Link className="primary-action" to="/crewmates">Go to gallery</Link>
      </div>
    </section>
  );
}

function buildStats(crewmates) {
  if (!crewmates.length) {
    return {
      topRole: 'None yet',
      success: 0,
      message: 'Start recruiting to calculate your mission readiness.',
    };
  }

  const roleCounts = crewmates.reduce((counts, crewmate) => {
    counts[crewmate.role] = (counts[crewmate.role] || 0) + 1;
    return counts;
  }, {});

  const topRole = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0][0];
  const uniqueRoles = Object.keys(roleCounts).length;
  const uniqueTraits = new Set(crewmates.map((crewmate) => crewmate.trait)).size;
  const success = Math.min(100, Math.round((uniqueRoles / 4) * 60 + (uniqueTraits / 6) * 40));

  return {
    topRole,
    success,
    message:
      success >= 75
        ? 'This team has strong role coverage and enough personality range to adapt.'
        : 'Recruit more role variety and personality variety to raise readiness.',
  };
}

export default function App() {
  return <Layout />;
}
