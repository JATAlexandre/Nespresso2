"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, AlertCircle, RefreshCw, Send, Mail, Lock, Server } from "lucide-react"

export default function EmailConfigPage() {
  const [emailUser, setEmailUser] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [maskedEmailUser, setMaskedEmailUser] = useState("")
  const [maskedEmailPassword, setMaskedEmailPassword] = useState("")
  const [testEmail, setTestEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Charger les identifiants actuels (masqués)
  useEffect(() => {
    async function loadCurrentConfig() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/check-env")
        const data = await response.json()

        if (data.variables?.EMAIL_USER?.defined) {
          setMaskedEmailUser(data.variables.EMAIL_USER.value)
        }

        if (data.variables?.EMAIL_PASSWORD?.defined) {
          setMaskedEmailPassword("********")
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration:", error)
        setError("Impossible de charger la configuration actuelle")
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrentConfig()
  }, [])

  // Mettre à jour les identifiants
  const updateCredentials = async () => {
    setIsLoading(true)
    setMessage("")
    setError("")

    if (!emailUser || !emailPassword) {
      setError("Veuillez remplir tous les champs")
      setIsLoading(false)
      return
    }

    try {
      // Dans un environnement de production, vous devriez avoir une API pour mettre à jour les variables d'environnement
      // Ici, nous simulons simplement la mise à jour
      alert(`
        Dans un environnement de production, vous devriez mettre à jour les variables d'environnement:
        
        EMAIL_USER=${emailUser}
        EMAIL_PASSWORD=********
        
        Pour l'instant, ces valeurs sont dans le fichier .env.
      `)

      setMessage("Identifiants mis à jour avec succès (simulation)")

      // Mettre à jour les valeurs masquées
      setMaskedEmailUser(emailUser)
      setMaskedEmailPassword("********")

      // Réinitialiser les champs
      setEmailUser("")
      setEmailPassword("")
    } catch (error) {
      setError("Erreur lors de la mise à jour des identifiants")
      console.error("Erreur lors de la mise à jour des identifiants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Envoyer un email de test
  const sendTestEmail = async () => {
    if (!testEmail) {
      setError("Veuillez entrer une adresse email de test")
      return
    }

    setIsSendingTestEmail(true)
    setEmailStatus("idle")
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()

      if (data.success) {
        setEmailStatus("success")
        setMessage(`Email de test envoyé avec succès à ${testEmail}`)
      } else {
        setEmailStatus("error")
        setError(`Erreur lors de l'envoi de l'email: ${data.error || "Échec de l'envoi"}`)
      }
    } catch (error) {
      setEmailStatus("error")
      setError("Erreur lors de l'envoi de l'email de test")
      console.error("Erreur lors de l'envoi de l'email de test:", error)
    } finally {
      setIsSendingTestEmail(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Configuration des emails (Office 365)</h1>

      {/* Identifiants actuels */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Configuration actuelle</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Adresse email:</p>
            <div className="flex items-center">
              <div className="bg-gray-100 px-4 py-2 rounded-md flex-1">
                {isLoading ? (
                  <div className="animate-pulse h-5 bg-gray-200 rounded w-40"></div>
                ) : (
                  <code>{maskedEmailUser || "Non configuré"}</code>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Mot de passe:</p>
            <div className="flex items-center">
              <div className="bg-gray-100 px-4 py-2 rounded-md flex-1">
                {isLoading ? (
                  <div className="animate-pulse h-5 bg-gray-200 rounded w-40"></div>
                ) : (
                  <code>{maskedEmailPassword || "Non configuré"}</code>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Serveur SMTP:</p>
            <div className="flex items-center">
              <div className="bg-gray-100 px-4 py-2 rounded-md flex-1">
                <code>smtp.office365.com:587</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mettre à jour les identifiants */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Mettre à jour les identifiants</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="emailUser" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <Input
                id="emailUser"
                type="email"
                value={emailUser}
                onChange={(e) => setEmailUser(e.target.value)}
                placeholder="Entrez votre adresse email Office 365"
                className="pl-10"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="emailPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Input
                id="emailPassword"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="pl-10"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Button
            onClick={updateCredentials}
            disabled={isLoading || !emailUser || !emailPassword}
            className="mt-2 bg-[#c36043] hover:bg-[#a34e35]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Mise à jour...
              </>
            ) : (
              "Mettre à jour les identifiants"
            )}
          </Button>
        </div>
      </div>

      {/* Envoyer un email de test */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Envoyer un email de test</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email de test
            </label>
            <Input
              id="testEmail"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Entrez une adresse email pour le test"
            />
          </div>

          <Button onClick={sendTestEmail} disabled={isSendingTestEmail || !testEmail} className="mt-2">
            {isSendingTestEmail ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer un email de test
              </>
            )}
          </Button>

          {emailStatus === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
              <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
              <p>{message}</p>
            </div>
          )}

          {emailStatus === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Message global */}
      {message && emailStatus !== "success" && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">{message}</div>
      )}

      {error && emailStatus !== "error" && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      )}
    </div>
  )
} 