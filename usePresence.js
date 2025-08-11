import { useEffect } from "react";
import {
  ref,
  onDisconnect,
  onValue,
  get,
  set,
  update,
  serverTimestamp,
} from "firebase/database";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export function usePresence() {
  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userRef = ref(db, `usuarios/${user.uid}`);
      const userStatusRef = ref(db, `usuarios/${user.uid}/status`);

      // Verifica se o usuário já existe no DB
      const snap = await get(userRef);
      if (!snap.exists()) {
        // Cria registro inicial
        await set(userRef, {
          uid: user.uid,
          nome: user.displayName || "",
          email: user.email || "",
          funcao: "", // ou defina conforme sua lógica
          status: {
            online: false,
            lastSeen: serverTimestamp(),
            ativo: true,
          },
        });
      }

      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) return;

        // Ao desconectar
        onDisconnect(userStatusRef).update({
          online: false,
          lastSeen: serverTimestamp(),
        });

        // Ao conectar
        update(userStatusRef, {
          online: true,
          lastSeen: serverTimestamp(),
          ativo: true,
        });
      });
    });

    return () => unsubscribeAuth();
  }, []);
}
