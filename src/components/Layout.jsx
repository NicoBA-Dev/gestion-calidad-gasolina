import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout({ title, children }) {
  return (
    <div className="flex min-h-screen bg-bg-base">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}