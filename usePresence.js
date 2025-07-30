import { useEffect } from "react"
import { ref, onDisconnect, onValue, update, serverTimestamp } from "firebase/database"
import { auth, db } from "./firebase"
import { onAuthStateChanged } from "firebase/auth"

export function usePresence() {
  useEffect(() => {
    const connectedRef = ref(db, ".info/connected")

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return

      const userStatusRef = ref(db, `usuarios/${user.uid}/status`)

      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) return

        onDisconnect(userStatusRef)
          .update({
            online: false,
            lastSeen: serverTimestamp(),
          })
          .then(() => {
            update(userStatusRef, {
              online: true,
              lastSeen: serverTimestamp(),
            })
          })
      })
    })

    return () => {
      unsubscribeAuth()
    }
  }, [])
}
