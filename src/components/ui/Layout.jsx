import Header from './Header'
import Footer from '../common/Footer'
import { Outlet } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="grow">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  )
}