import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const DbContext = createContext(null);

export const DbProvider = ({ createDatabase, fallback, children }) => {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializeDb = useCallback(async () => {
    const database = await createDatabase();
    setDb(database);
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeDb();
  }, [initializeDb]);

  if (loading) return fallback ? fallback({ message: "Loading..." }) : null;

  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (context === null) {
    throw new Error("useDb must be used within a DbProvider");
  }
  return context;
};

export default { DbProvider, useDb };
