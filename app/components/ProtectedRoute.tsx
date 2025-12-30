import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export function withProtectedRoute<P extends object>(Component: React.ComponentType) {
  
  return function ProtectedComponent(props: P){
    const { isNewUser, isLoading, isWalletConnected } = useAuth();

    useEffect(() => {
      if (!isLoading && (!isWalletConnected || isNewUser)) {
        redirect("/");
      }
    }, [isLoading, isWalletConnected, isNewUser]);
  
    if (isLoading) {
      return (
        <div className="h-screen flex items-center justify-center">
          Loading...
        </div>
      );
    }
    return <Component {...props}/>
  }
 }
