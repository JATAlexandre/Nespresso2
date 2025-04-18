// API client functions for the subscription service

export async function submitSubscription(subscriptionData: any) {
  try {
    const response = await fetch("/api/subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    })

    if (!response.ok) {
      throw new Error("Failed to submit subscription")
    }

    return await response.json()
  } catch (error) {
    console.error("Error submitting subscription:", error)
    throw error
  }
}

export async function getSubscriptionOptions() {
  try {
    const response = await fetch("/api/subscription")

    if (!response.ok) {
      throw new Error("Failed to fetch subscription options")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching subscription options:", error)
    throw error
  }
}
