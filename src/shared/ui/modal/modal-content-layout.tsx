import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

type ModalContentLayout = {
  contentMaxHeight: number;
};

const ModalContentLayoutContext = createContext<ModalContentLayout>({
  contentMaxHeight: Number.POSITIVE_INFINITY,
});

export function ModalContentLayoutProvider({
  children,
  contentMaxHeight,
}: {
  children: ReactNode;
  contentMaxHeight: number;
}) {
  return (
    <ModalContentLayoutContext.Provider
      value={{
        contentMaxHeight,
      }}
    >
      {children}
    </ModalContentLayoutContext.Provider>
  );
}

export function useModalContentLayout() {
  return useContext(ModalContentLayoutContext);
}
