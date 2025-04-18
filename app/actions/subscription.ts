"use server"

export const submitSubscriptionAction = async (formData: FormData) => {
  try {
    const subscriptionDataString = formData.get("subscriptionData") as string
    const subscriptionData = JSON.parse(subscriptionDataString)

    // Utiliser l'URL relative au lieu de dépendre d'une variable d'environnement
    const response = await fetch(`/api/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    })

    if (!response.ok) {
      console.error("Server error:", response.status, response.statusText)
      return { success: false, message: "Failed to submit subscription" }
    }

    const result = await response.json()

    return { success: true, message: "Subscription submitted successfully", data: result }
  } catch (error) {
    console.error("Client-side error:", error)
    return { success: false, message: "Failed to submit subscription" }
  }
}
