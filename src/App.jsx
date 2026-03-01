import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setPokemon(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPokemon = async () => {
      setLoading(true);
      setError(null);
      setPokemon(null);

      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${searchTerm.trim().toLowerCase()}`,
          { signal }
        );

        if (!res.ok) {
          if (res.status === 404) {
            setError('pokemon no encontrado');
          } else {
            setError('Error al buscar el Pokémon');
          }
          setPokemon(null);
          return;
        }

        const data = await res.json();
        setPokemon({
          name: data.name,
          image: data.sprites?.front_default,
          id: data.id,
          types: data.types?.map((t) => t.type.name) ?? [],
        });
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('Error de conexión con la API');
        setPokemon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
    return () => controller.abort();
  }, [searchTerm]);

  return (
    <div className="app">
      <h1>Buscador de Pokémon</h1>

      <form
        className="search-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="pokemon-search">Buscar Pokémon</label>
        <input
          id="pokemon-search"
          type="text"
          placeholder="Ej: Pikachu, charmander..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />
      </form>

      <section className="results">
        {loading && <p className="loading">Buscando...</p>}

        {!loading && searchTerm.trim() && error && (
          <p className="error">{error}</p>
        )}

        {!loading && searchTerm.trim() && !error && pokemon && (
          <article className="pokemon-card">
            <h2>{pokemon.name}</h2>
            {pokemon.image && (
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="pokemon-img"
              />
            )}
            {pokemon.id && (
              <p className="pokemon-id">Nº {pokemon.id}</p>
            )}
            {pokemon.types?.length > 0 && (
              <p className="pokemon-types">
                Tipo: {pokemon.types.join(', ')}
              </p>
            )}
          </article>
        )}

        {!loading && !searchTerm.trim() && (
          <p className="hint">Escribe el nombre de un Pokémon para buscar</p>
        )}
      </section>
    </div>
  );
}

export default App;
