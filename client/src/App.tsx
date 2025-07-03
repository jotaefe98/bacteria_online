import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Lobby from './components/Lobby/Lobby';
import Room from './components/Room/Room';




function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Lobby />} />
        <Route path='/room/:roomId' element={<Room />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App