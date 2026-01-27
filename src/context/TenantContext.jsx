import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/services/apiClient";

const TenantContext = createContext(null);

export function useTenant() {
  return useContext(TenantContext);
}

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [tenantLoading, setTenantLoading] = useState(true);

  useEffect(() => {
    async function loadTenant() {
      try {
        // precisa existir no backend: GET /api/public/tenant
        const { data } = await apiClient.get("/public/tenant");
        setTenant(data);
      } catch (e) {
        setTenant(null);
      } finally {
        setTenantLoading(false);
      }
    }
    loadTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, tenantLoading }}>
      {children}
    </TenantContext.Provider>
  );
}
