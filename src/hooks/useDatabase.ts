import { getDatabase, isDbReady, SQLiteDatabase } from "@/database/db";
import { useEffect, useState } from "react";

export function useDatabase() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDb = async () => {
      try {
        if (!isDbReady()) {
          const database = await getDatabase();
          setDb(database);
        }
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsReady(true);
      }
    };

    initializeDb();
  }, []);

  return { db, isReady, error };
}
