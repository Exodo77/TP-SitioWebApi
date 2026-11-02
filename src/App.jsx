import React, { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import clubes from './data/clubes.js'
import './App.css'

function Inicio() {
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard')
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudieron cargar los partidos.')
        return respuesta.json()
      })
      .then((datos) => {
        if (datos.code || !Array.isArray(datos.events)) {
          throw new Error('La respuesta de ESPN no tiene el formato esperado.')
        }
        setPartidos(datos.events)
      })
      .catch(() => setError('Ocurrió un error al cargar los partidos.'))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <p className="mensaje">Cargando...</p>
  if (error) return <p className="mensaje">{error}</p>
  if (!partidos.length) return <main className="contenedor"><h1>Fútbol argentino</h1><p className="mensaje">No hay partidos programados para hoy.</p></main>

  return (
    <main className="contenedor">
      <h1>Fútbol argentino</h1>
      <p className="introduccion">Partidos de la Liga Profesional argentina de hoy</p>
      <section className="tarjetas">
        {partidos.map((partido) => (
          <article className="tarjeta" key={partido.id}>
            <div className="contenido-tarjeta">
              <div className="partido-equipos">
                {partido.competitions?.[0]?.competitors
                  ?.slice()
                  .sort((a, b) => (a.homeAway === 'home' ? -1 : 1) - (b.homeAway === 'home' ? -1 : 1))
                  .map((competidor) => (
                    <div className="equipo-partido" key={competidor.id}>
                      {competidor.team.logo && <img src={competidor.team.logo} alt={`Escudo de ${competidor.team.displayName}`} />}
                      <span>{competidor.team.displayName}</span>
                    </div>
                  ))}
              </div>
              <h2 className="versus">{partido.status?.type?.shortDetail || 'Partido'}</h2>
              <p><strong>Resultado:</strong> {partido.competitions?.[0]?.competitors?.find((equipo) => equipo.homeAway === 'home')?.score ?? '-'} - {partido.competitions?.[0]?.competitors?.find((equipo) => equipo.homeAway === 'away')?.score ?? '-'}</p>
              <p><strong>Fecha:</strong> {partido.date ? new Date(partido.date).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' }) : 'No disponible'}</p>
              <p><strong>Estadio:</strong> {partido.competitions?.[0]?.venue?.fullName || 'No disponible'}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function Clubes() {
  return (
    <main className="contenedor">
      <h1>Clubes argentinos</h1>
      <p className="introduccion">Conocé algunos clubes de nuestro fútbol.</p>
      <section className="tarjetas">
        {clubes.map((club) => (
          <article className="tarjeta" key={club.id}>
            <img className="imagen-club" src={club.imagen} alt={`Escudo de ${club.nombre}`} />
            <div className="contenido-tarjeta">
              <h2>{club.nombre}</h2>
              <p><strong>Estadio:</strong> {club.estadio}</p>
              <p><strong>Fundación:</strong> {club.fundacion}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function Contacto() {
  return (
    <main className="contenedor">
      <h1>Contacto</h1>
      <p className="introduccion">Dejanos tu mensaje.</p>
      <section className="contacto">
        <form className="formulario" action="https://formspree.io/f/xoeepkgo" method="POST">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" autoComplete="name" required />
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="mensaje">Mensaje</label>
          <textarea id="mensaje" name="mensaje" rows="6" required />
          <button type="submit">Enviar mensaje</button>
        </form>
        <iframe className="mapa" title="Mapa del Estadio Monumental" src="https://maps.google.com/maps?q=Estadio%20Monumental%20Buenos%20Aires&t=&z=14&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </section>
    </main>
  )
}

export default function App() {
  return (
    <>
      <header className="encabezado">
        <Link className="marca" to="/">Pasión Argentina</Link>
        <nav aria-label="Navegación principal">
          <Link to="/">Inicio</Link>
          <Link to="/clubes">Clubes</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/clubes" element={<Clubes />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="*" element={<main className="contenedor"><h1>Página no encontrada</h1><Link to="/">Volver al inicio</Link></main>} />
      </Routes>
      <footer className="pie"><p>Trabajo práctico · Fútbol argentino</p></footer>
    </>
  )
}
