
import { usePresence } from '../usePresence'
import './App.css'
import { Outlet } from 'react-router-dom'

function App() {

  usePresence();
  
  return (
    <>
      <div>
        <Outlet />
      </div>
    </>
  )
}

export default App
