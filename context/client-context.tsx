"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type ClientInfo = {
  companyName: string
  email: string
  phone: string
}

type ClientContextType = {
  clientInfo: ClientInfo | null
  setClientInfo: (info: ClientInfo) => void
  showWelcomeModal: boolean
  setShowWelcomeModal: (show: boolean) => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clientInfo, setClientInfoState] = useState<ClientInfo | null>(null)
  // Changer la valeur par défaut à false pour ne pas afficher le modal de bienvenue
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  const setClientInfo = (info: ClientInfo) => {
    setClientInfoState(info)
    // Optionally save to localStorage
    localStorage.setItem("clientInfo", JSON.stringify(info))
  }

  return (
    <ClientContext.Provider
      value={{
        clientInfo,
        setClientInfo,
        showWelcomeModal,
        setShowWelcomeModal,
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider")
  }
  return context
}
