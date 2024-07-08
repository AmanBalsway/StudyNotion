import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Home } from "./pages/Home"
import { useState } from 'react';
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { Navbar } from './components/common/Navbar';
import { ForgotPassword } from './pages/ForgotPassword';
import OpenRoute from './components/core/Auth/OpenRoute';
import { UpdatePassword } from './pages/UpdatePassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { About } from './pages/About';
import Dashboard from './pages/Dashboard';

function App() {

  return (
    <div className='w-screen min-h-screen bg-richblack-900 flex flex-col font-inter'>
      <Navbar />
      <Routes>

        <Route path='/' element={<Home />} />

        <Route path="/login" element={

          <OpenRoute>
            <Login />
          </OpenRoute>}

        />

        <Route path='/signup' element={

          <OpenRoute>
            <Signup />
          </OpenRoute>}

        />

        <Route path='/forgot-password' element={

          <OpenRoute>
            <ForgotPassword />
          </OpenRoute>

        } />

        <Route path='/update-password/:id' element={

          <OpenRoute>
            <UpdatePassword />
          </OpenRoute>

        } />

        <Route path='/verify-email' element={

          <OpenRoute>
            <VerifyEmail />
          </OpenRoute>

        } />

        <Route path='/about' element={
            <About />
        } />

        <Route path='dashboard/my-profile' element={<MyProfile />}/>

      </Routes>
    </div>
  )
}

export default App
