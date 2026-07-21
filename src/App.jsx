import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  createCrewmate,
  deleteCrewmate,
  getCrewmate,
  getCrewmates,
  updateCrewmate,
} from './services/crewmateService';

const speeds = ['Slow', 'Medium', 'Fast'];
const colors = ['Red', 'Blue', 'Green', 'Purple'];

const blankCrewmate = {
  name: '',
  speed: 'Medium',
  color: 'Red',
  notes: '',
};

function App() {
  return (
    <div className="app">
      <header>
        <Link to="/" className="title">Crewmates</Link>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/create">Create</NavLink>
          <NavLink to="/crewmates">Gallery</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateCrewmate />} />
        <Route path="/crewmates" element={<CrewmateGallery />} />
        <Route path="/crewmates/:id" element={<CrewmateDetails />} />
        <Route path="/edit/:id" element={<EditCrewmate />} />
      </Routes>
    </div>
  );
}

function Home() {
  return (
    <main className="page">
      <h1>Welcome to Crewmates</h1>
      <p>Create a simple crew, view your crewmates, edit them, and delete them.</p>
      <Link className="button" to="/create">Create a crewmate</Link>
    </main>
  );
}

function CreateCrewmate() {
  const navigate = useNavigate();

  const handleSubmit = async (crewmate) => {
    const created = await createCrewmate(crewmate);
    navigate(`/crewmates/${created.id}`);
  };

  return (
    <main className="page">
      <h1>Create a New Crewmate</h1>
      <CrewmateForm buttonText="Create Crewmate" onSubmit={handleSubmit} />
    </main>
  );
}

function CrewmateGallery() {
  const [crewmates, setCrewmates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getCrewmates()
      .then(setCrewmates)
      .catch(() => setError('Could not load crewmates.'));
  }, []);

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <h1>Your Crewmate Gallery</h1>
          <p>Newest crewmates show up first.</p>
        </div>
        <Link className="button" to="/create">Add crewmate</Link>
      </div>

      {error && <p className="error">{error}</p>}

      {crewmates.length === 0 ? (
        <p>No crewmates yet.</p>
      ) : (
        <div className="grid">
          {crewmates.map((crewmate) => (
            <article className="card" key={crewmate.id}>
              <Link to={`/crewmates/${crewmate.id}`}>
                <h2>{crewmate.name}</h2>
                <p>Speed: {crewmate.speed}</p>
                <p>Color: {crewmate.color}</p>
              </Link>
              <Link className="small-button" to={`/edit/${crewmate.id}`}>Edit</Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function CrewmateDetails() {
  const { id } = useParams();
  const [crewmate, setCrewmate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCrewmate(id)
      .then((data) => {
        if (!data) {
          setError('Crewmate not found.');
          return;
        }
        setCrewmate(data);
      })
      .catch(() => setError('Could not load this crewmate.'));
  }, [id]);

  if (error) return <Message text={error} />;
  if (!crewmate) return <Message text="Loading..." />;

  return (
    <main className="page">
      <Link to="/crewmates">Back to gallery</Link>
      <section className="detail">
        <h1>{crewmate.name}</h1>
        <p><strong>Speed:</strong> {crewmate.speed}</p>
        <p><strong>Color:</strong> {crewmate.color}</p>
        <p><strong>Created:</strong> {new Date(crewmate.created_at).toLocaleString()}</p>
        <p><strong>Notes:</strong> {crewmate.notes || 'No notes yet.'}</p>
        <Link className="button" to={`/edit/${crewmate.id}`}>Edit crewmate</Link>
      </section>
    </main>
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
        if (!data) {
          setError('Crewmate not found.');
          return;
        }
        setCrewmate(data);
      })
      .catch(() => setError('Could not load this crewmate.'));
  }, [id]);

  const handleSubmit = async (updates) => {
    await updateCrewmate(id, updates);
    navigate('/crewmates');
  };

  const handleDelete = async () => {
    await deleteCrewmate(id);
    navigate('/crewmates');
  };

  if (error) return <Message text={error} />;
  if (!crewmate) return <Message text="Loading..." />;

  return (
    <main className="page">
      <h1>Update Crewmate</h1>
      <CrewmateForm
        crewmate={crewmate}
        buttonText="Update Crewmate"
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </main>
  );
}

function CrewmateForm({ crewmate = blankCrewmate, buttonText, onSubmit, onDelete }) {
  const [formData, setFormData] = useState({ ...blankCrewmate, ...crewmate });
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter a name.');
      return;
    }

    setError('');
    await onSubmit({ ...formData, name: formData.name.trim() });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <label>
        Name
        <input
          value={formData.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="Crewmate name"
        />
      </label>

      <fieldset>
        <legend>Speed</legend>
        {speeds.map((speed) => (
          <label className="choice" key={speed}>
            <input
              type="radio"
              name="speed"
              value={speed}
              checked={formData.speed === speed}
              onChange={() => updateField('speed', speed)}
            />
            {speed}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Color</legend>
        {colors.map((color) => (
          <label className="choice" key={color}>
            <input
              type="radio"
              name="color"
              value={color}
              checked={formData.color === color}
              onChange={() => updateField('color', color)}
            />
            {color}
          </label>
        ))}
      </fieldset>

      <label>
        Notes
        <textarea
          value={formData.notes || ''}
          onChange={(event) => updateField('notes', event.target.value)}
          placeholder="Extra details for the crewmate"
        />
      </label>

      <div className="actions">
        <button className="button" type="submit">{buttonText}</button>
        {onDelete && (
          <button className="delete-button" type="button" onClick={onDelete}>
            Delete Crewmate
          </button>
        )}
      </div>
    </form>
  );
}

function Message({ text }) {
  return (
    <main className="page">
      <p>{text}</p>
      <Link className="button" to="/crewmates">Go to gallery</Link>
    </main>
  );
}

export default App;
