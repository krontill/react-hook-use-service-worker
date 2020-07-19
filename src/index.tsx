import * as React from 'react';

import { register, unregister } from 'register-service-worker';

export const SERVICE_WORKER_READY = 'SERVICE_WORKER_READY';
export const SERVICE_WORKER_REGISTERED = 'SERVICE_WORKER_REGISTERED';
export const SERVICE_WORKER_CACHED = 'SERVICE_WORKER_CACHED';
export const SERVICE_WORKER_UPDATE_FOUND = 'SERVICE_WORKER_UPDATE_FOUND';
export const SERVICE_WORKER_OFFLINE = 'SERVICE_WORKER_OFFLINE';
export const SERVICE_WORKER_UPDATE_READY = 'SERVICE_WORKER_UPDATE_READY';
export const SERVICE_WORKER_ERROR = 'SERVICE_WORKER_ERROR';

interface ServiceWorkerReady {
  type: typeof SERVICE_WORKER_READY;
  payload: ServiceWorker;
}
interface ServiceWorkerRegistered {
  type: typeof SERVICE_WORKER_REGISTERED;
  payload: ServiceWorker;
}
interface ServiceWorkerCached {
  type: typeof SERVICE_WORKER_CACHED;
  payload: ServiceWorker;
}
interface ServiceWorkerUpdateFound {
  type: typeof SERVICE_WORKER_UPDATE_FOUND;
  payload: ServiceWorker;
}
interface ServiceWorkerOffline {
  type: typeof SERVICE_WORKER_OFFLINE;
  payload: ServiceWorker;
}
interface ServiceWorkerUpdateReady {
  type: typeof SERVICE_WORKER_UPDATE_READY;
  payload: ServiceWorker;
}
interface ServiceWorkerError {
  type: typeof SERVICE_WORKER_ERROR;
  payload: ServiceWorker;
}

export type ServiceWorkerActionTypes =
  | ServiceWorkerReady
  | ServiceWorkerRegistered
  | ServiceWorkerCached
  | ServiceWorkerUpdateFound
  | ServiceWorkerOffline
  | ServiceWorkerUpdateReady
  | ServiceWorkerError;

type ServiceWorkerStatus =
  | 'offline'
  | 'registered'
  | 'register'
  | 'ready'
  | 'cached'
  | 'updates'
  | 'updated'
  | 'error';

export interface ServiceWorker {
  serviceWorkerStatus: ServiceWorkerStatus;
  registration?: null | ServiceWorkerRegistration;
  error?: Error;
}

export interface ServiceWorkerState {
  serviceWorkerStatus: ServiceWorkerStatus;
  registration?: null | ServiceWorkerRegistration;
  error?: Error;
}

const useServiceWorkerReducer = (
  state: ServiceWorkerState,
  action: ServiceWorkerActionTypes
): ServiceWorkerState => {
  switch (action.type) {
    case 'SERVICE_WORKER_READY':
      console.log('Service worker is ready.');
      return {
        ...state,
        serviceWorkerStatus: action.payload.serviceWorkerStatus,
        registration: action.payload.registration,
      };
    case 'SERVICE_WORKER_REGISTERED':
      console.log('Service worker has been registered.');
      return {
        ...state,
        serviceWorkerStatus: action.payload.serviceWorkerStatus,
        registration: action.payload.registration,
      };
    case 'SERVICE_WORKER_CACHED':
      console.log('Content has been cached for offline use.');
      return {
        ...state,
        serviceWorkerStatus: action.payload.serviceWorkerStatus,
        registration: action.payload.registration,
      };
    case 'SERVICE_WORKER_UPDATE_FOUND':
      console.log('New content is downloading.');
      return {
        ...state,
        serviceWorkerStatus: action.payload.serviceWorkerStatus,
        registration: action.payload.registration,
      };
    case 'SERVICE_WORKER_UPDATE_READY':
      console.log('New content is available; please refresh.');
      return {
        ...state,
        serviceWorkerStatus: action.payload.serviceWorkerStatus,
        registration: action.payload.registration,
      };
    case 'SERVICE_WORKER_OFFLINE':
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
      return {
        ...state,
        serviceWorkerStatus: action.payload.serviceWorkerStatus,
      };
    case 'SERVICE_WORKER_ERROR':
      console.error(
        'Error during service worker registration:',
        action.payload.error
      );
      return {
        ...state,
        serviceWorkerStatus: action.payload.serviceWorkerStatus,
      };

    default:
      return state;
  }
};

const initialState: ServiceWorkerState = {
  registration: null,
  serviceWorkerStatus: 'register',
};
const serviceWorkerContext = React.createContext(initialState);

export function ProvideServiceWorker({
  children,
  fileName,
}: {
  children: React.ReactNode;
  fileName: string;
}) {
  const serviceWorker = useProvideServiceWorker(fileName);
  return (
    <serviceWorkerContext.Provider value={serviceWorker}>
      {children}
    </serviceWorkerContext.Provider>
  );
}

export const useServiceWorker = () => {
  return React.useContext(serviceWorkerContext);
};

const useProvideServiceWorker = (file = 'sw.js', registrationOptions = {} ) => {
  const [swState, dispatch] = React.useReducer(
    useServiceWorkerReducer,
    initialState
  );
  React.useEffect(() => {
    register(file, {
      registrationOptions: registrationOptions,
      ready: registration => {
        dispatch({
          type: 'SERVICE_WORKER_READY',
          payload: { serviceWorkerStatus: 'ready', registration },
        });
      },
      registered: registration => {
        dispatch({
          type: 'SERVICE_WORKER_REGISTERED',
          payload: { serviceWorkerStatus: 'registered', registration },
        });
      },
      cached: registration => {
        dispatch({
          type: 'SERVICE_WORKER_REGISTERED',
          payload: { serviceWorkerStatus: 'cached', registration },
        });
      },
      updatefound: registration => {
        dispatch({
          type: 'SERVICE_WORKER_UPDATE_FOUND',
          payload: { serviceWorkerStatus: 'updates', registration },
        });
      },
      updated: registration =>
        dispatch({
          type: 'SERVICE_WORKER_UPDATE_READY',
          payload: { serviceWorkerStatus: 'updated', registration },
        }),
      offline: () => {
        dispatch({
          type: 'SERVICE_WORKER_OFFLINE',
          payload: { serviceWorkerStatus: 'offline' },
        });
      },
      error: error =>
        dispatch({
          type: 'SERVICE_WORKER_OFFLINE',
          payload: { serviceWorkerStatus: 'error', error },
        }),
    });
    return () => {
      unregister();
    };
  }, []);

  return swState;
};
