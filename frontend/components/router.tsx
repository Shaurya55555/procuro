import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Custom hash-based router to avoid relying on the CDN import map for react-router-dom.
// All routing utilities should be imported from this file.

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

  let elementToRender: ReactNode = null;
  let params: Record<string, string> = {};
  let wildcardElement: ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as any;
    const routePath = props.path;

    // Save wildcard for later use as fallback
    if (routePath === '*') {
      wildcardElement = props.element;
      return;
    }

    if (elementToRender) return;

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

  // Fall back to the wildcard route if nothing matched
  const rendered = elementToRender ?? wildcardElement;

  return (
    <RouterContext.Provider value={{ path, navigate: ctx?.navigate || (() => {}), params }}>
      {rendered}
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
