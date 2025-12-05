import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Mini Router Implementation to fix missing react-router-dom ---

const RouterContext = createContext<{
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
} | null>(null);

export const HashRouter: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const onHashChange = () => {
      const p = window.location.hash.slice(1) || '/';
      setPath(p);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return (
    <RouterContext.Provider value={{ path, navigate, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
};

export const Routes: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ctx = useContext(RouterContext);
  const path = ctx?.path || '/';
  const navigate = ctx?.navigate || (() => {});
  
  let elementToRender: ReactNode = null;
  let params: Record<string, string> = {};

  React.Children.forEach(children, (child) => {
    if (elementToRender || !React.isValidElement(child)) return;
    const props = child.props as any;
    const routePath = props.path;
    
    if (routePath === path) {
      elementToRender = props.element;
      return;
    }

    if (routePath && routePath.includes(':')) {
      const rParts = routePath.split('/');
      const pParts = path.split('/');
      if (rParts.length === pParts.length) {
        let match = true;
        const currentParams: Record<string, string> = {};
        for (let i = 0; i < rParts.length; i++) {
          if (rParts[i].startsWith(':')) {
            currentParams[rParts[i].slice(1)] = pParts[i];
          } else if (rParts[i] !== pParts[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          elementToRender = props.element;
          params = currentParams;
        }
      }
    }
  });

  return (
    <RouterContext.Provider value={{ path, navigate, params }}>
      {elementToRender}
    </RouterContext.Provider>
  );
};

export const Route: React.FC<{ path: string; element: ReactNode }> = () => null;

export const Link: React.FC<{ to: string; children: ReactNode; className?: string }> = ({ to, children, className }) => {
  return (
    <a href={`#${to}`} className={className}>
      {children}
    </a>
  );
};

export const useLocation = () => {
  const ctx = useContext(RouterContext);
  return { pathname: ctx?.path || '/' };
};

export const useNavigate = () => {
  const ctx = useContext(RouterContext);
  return ctx?.navigate || ((to: string) => { window.location.hash = to; });
};

export const useParams = <T extends Record<string, string>>() => {
  const ctx = useContext(RouterContext);
  return (ctx?.params || {}) as T;
};

// --- Original Spinner Component ---

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default Spinner;