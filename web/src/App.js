import React, { useEffect, useState } from 'react';
import api from './services/api'

import './global.css'
import './App.css'
import './Sidebar.css'
import './Main.css'

function App() {
  const [Devs, setDevs] = useState([])

  const [github_username, setGithubUsername] = useState('')
  const [techs, setTechs] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  useEffect(()=> {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        setLatitude(latitude)
        setLongitude(longitude)
      } ,
      (err) => {
        console.log(err)
      },
      {
        timeout: 30000
      }
    )
  }, [])

  useEffect(()=> {
    async function loadDevs() {
      const response = await api.get('/devs')
      setDevs(response.data)

    }
    loadDevs()
  }, [])

  async function handleAddDev(e) {
    e.preventDefault()
    const response = await api.post("/devs", {
      github_username,
      techs,
      latitude,
      longitude
    })
    setGithubUsername('')
    setTechs('')
    setDevs([...Devs, response.data])
    console.log(response.data)
  }

  return (
    <div id="app">
      <aside>
        <strong>Cadastrar</strong>
        <form onSubmit={handleAddDev}>
          <div className="input-block">
            <label htmlFor="github_username">Usuario do GitHub</label>
            <input name="github_username" id="github_username" value={github_username} onChange={e=> setGithubUsername(e.target.value)} required />
          </div>
          
          <div className="input-block">
            <label htmlFor="techs">Tecnologias</label>
            <input name="techs" id="techs" value={techs} onChange={e=> setTechs(e.target.value)} required />
          </div>
          <div className="input-group">
            <div className="input-block">
              <label htmlFor="latitude">Latitude</label>
              <input name="latitude" id="latitude" type="number" onChange={e=> setLatitude(e.target.value)} value={latitude} required />
            </div>

            <div className="input-block">
              <label htmlFor="longitude">Longitude</label>
              <input name="longitude" id="longitude" type="number" onChange={e=>setLongitude(e.target.value)} value={longitude} required />
            </div>
          </div>

          <button type="submit">Salvar</button>
                    
        </form>
      </aside>
      <main>
        <ul>
          {Devs.map(item=> (
            <li className="dev-item" key={item._id}>
              <header>
                <img src={item.avatar_url} alt={item.name} />
                <div className="user-info">
                  <strong>{item.name?item.name:item.github_username}</strong>
                  <span>{item.techs.join(', ')}</span>
                </div>
              </header>
              <p>{item.bio?item.bio: 'Usuario optou por não deixar biografia'}</p>
              <a href={`http://github.com/${item.github_username}`}>Acessar perfil no GitHub</a>
            </li>
          ))}
          

          
        </ul>
      </main>
    </div>  
    );
}

export default App;
