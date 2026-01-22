import { useEffect } from 'react'
import './App.css'
import { Canvas } from './components/Canvas/Canvas'
import { ZoomIndicator } from './components/Canvas/ZoomIndicator'
import { Toolbar } from './components/Toolbar/Toolbar'
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel'
import { StatusBar } from './components/StatusBar/StatusBar'
import { setupDevTools } from './lib/dev-tools'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  // Setup dev tools in development
  useEffect(() => {
    setupDevTools();
  }, []);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <PropertiesPanel />
      <Toolbar />
      <Canvas />
      <ZoomIndicator />
      <StatusBar />
    </div>
  )
}

export default App
