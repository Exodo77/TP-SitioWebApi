import React, { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import clubes from './data/clubes.js'
import './App.css'

function Inicio() {
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const formatoFechaApi = (fecha) => new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(fecha).replaceAll('-', '')
    const fechas = Array.from({ length: 8 }, (_, dia) => {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() + dia)
      return formatoFechaApi(fecha)
    })

    Promise.allSettled(fechas.map(async (fecha) => {
      const respuesta = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard?dates=${fecha}`)
      if (!respuesta.ok) throw new Error('No se pudieron cargar los partidos.')
      const datos = await respuesta.json()
      if (datos.code || !Array.isArray(datos.events)) throw new Error('La respuesta de ESPN no tiene el formato esperado.')
      return datos.events
    }))
      .then((resultados) => {
        const resultadosCorrectos = resultados.filter((resultado) => resultado.status === 'fulfilled')
        if (!resultadosCorrectos.length) throw new Error('No se pudieron cargar los partidos.')

        const partidosUnicos = new Map()
        resultadosCorrectos.forEach((resultado) => {
          resultado.value.forEach((partido) => partidosUnicos.set(partido.id, partido))
        })
        const proximosPartidos = Array.from(partidosUnicos.values())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 6)
        setPartidos(proximosPartidos)
      })
      .catch(() => setError('Ocurrió un error al cargar los partidos.'))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <p className="mensaje">Cargando...</p>
  if (error) return <p className="mensaje">{error}</p>
  if (!partidos.length) return <main className="contenedor"><h1>Fútbol argentino</h1><p className="mensaje">No hay partidos programados en los próximos días.</p></main>

  return (
    <main className="contenedor">
      <section className="inicio-hero">
        <div>
          <h1>Fútbol argentino</h1>
          <p className="introduccion">Próximos partidos de la Liga Profesional argentina</p>
        </div>
      </section>
      <section className="tarjetas">
        {partidos.map((partido) => {
          const competidores = partido.competitions?.[0]?.competitors || []
          const local = competidores.find((equipo) => equipo.homeAway === 'home')
          const visitante = competidores.find((equipo) => equipo.homeAway === 'away')
          const tipoEstado = partido.status?.type
          const estado = tipoEstado?.state === 'in'
            ? 'EN VIVO'
            : tipoEstado?.completed
              ? 'FINALIZADO'
              : 'PROGRAMADO'
          const hora = partido.date
            ? new Date(partido.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' })
            : '--:--'
          const fecha = partido.date
            ? new Date(partido.date).toLocaleDateString('es-AR', { dateStyle: 'medium', timeZone: 'America/Argentina/Buenos_Aires' })
            : 'Fecha no disponible'

          return (
            <article className="tarjeta tarjeta-partido" key={partido.id}>
              <div className="estado-partido"><span className={`estado-punto estado-${estado.toLowerCase().replace(' ', '-')}`} />{estado}</div>
              <div className="enfrentamiento">
                <div className="equipo-partido equipo-local" title={local?.team.displayName}>
                  {local?.team.logo && <img src={local.team.logo} alt={`Escudo de ${local.team.displayName}`} />}
                  <span>{local?.team.displayName || 'Local'}</span>
                </div>
                <div className="marcador-central" aria-label={estado === 'PROGRAMADO' ? `Comienza a las ${hora}` : 'Resultado del partido'}>
                  {estado === 'PROGRAMADO' ? <strong className="hora-partido">{hora}</strong> : <strong>{local?.score ?? '0'} <span>—</span> {visitante?.score ?? '0'}</strong>}
                  {estado === 'EN VIVO' && <small>EN JUEGO</small>}
                </div>
                <div className="equipo-partido equipo-visitante" title={visitante?.team.displayName}>
                  <span>{visitante?.team.displayName || 'Visitante'}</span>
                  {visitante?.team.logo && <img src={visitante.team.logo} alt={`Escudo de ${visitante.team.displayName}`} />}
                </div>
              </div>
              <footer className="pie-tarjeta-partido">
                <span className="dato-partido">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/></svg>
                  {fecha} · {hora}
                </span>
                <span className="dato-partido dato-estadio">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                  {partido.competitions?.[0]?.venue?.fullName || 'Estadio no disponible'}
                </span>
              </footer>
            </article>
          )
        })}
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
          <article className="tarjeta tarjeta-club" key={club.id}>
            <div className="club-cabecera">
              <img className="imagen-club" src={club.imagen} alt={`Escudo de ${club.nombre}`} />
              <h2 title={club.nombre}>{club.nombre}</h2>
            </div>
            <div className="datos-club">
              <span className="dato-club">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 12h.01M15 12h.01"/></svg>
                <span className="etiqueta-club">Estadio</span>
                <span className="valor-club" title={club.estadio}>{club.estadio}</span>
              </span>
              <span className="dato-club">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2"/></svg>
                <span className="etiqueta-club">Fundación</span>
                <span className="valor-club">{club.fundacion}</span>
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function Contacto() {
  const [ubicacion, setUbicacion] = useState(null)
  const [estadoUbicacion, setEstadoUbicacion] = useState('Elegí “Usar mi ubicación” para centrar el mapa en tu ubicación actual.')

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setEstadoUbicacion('Este navegador no permite acceder a la ubicación.')
      return
    }

    setEstadoUbicacion('Solicitando permiso para obtener tu ubicación...')
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setUbicacion({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude })
        setEstadoUbicacion('')
      },
      () => setEstadoUbicacion('No pudimos obtener tu ubicación. Revisá el permiso del navegador e intentá nuevamente.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const mapaSrc = ubicacion
    ? `https://maps.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}&z=15&output=embed`
    : 'https://maps.google.com/maps?q=Buenos%20Aires%2C%20Argentina&z=12&output=embed'

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
        <div className="mapa-panel">
          <iframe className="mapa" title={ubicacion ? 'Mapa de tu ubicación actual' : 'Mapa de Buenos Aires'} src={mapaSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <button className="boton-ubicacion" type="button" onClick={obtenerUbicacion}>{ubicacion ? 'Actualizar mi ubicación' : 'Usar mi ubicación'}</button>
          <p className="estado-ubicacion" aria-live="polite">{estadoUbicacion}</p>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  return (
    <>
      <header className="encabezado">
        <Link className="marca" to="/">Partidos Argentinos</Link>
        <img className="logo-cabecera" src="https://www.marmonsports.com/img/cms/Logos/logo-afa-2024.png" alt="Escudo de la AFA" />
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
      <footer className="pie"><p>Partidos del fútbol argentino</p></footer>
    </>
  )
}
