import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Loader from "../components/loader/Loader";

const DbContext = createContext(null);

export const DbProvider = ({ createDatabase, children }) => {
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

  if (loading) return <Loader message={"Loading..."} />;

  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (context === null) {
    throw new Error("useDb must be used within a DbProvider");
  }
  return context;
};
