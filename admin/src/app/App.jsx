import ToastHost from "../components/ui/ToastHost";

export default function App({ children }) {
  return (
    <>
      {children}
      <ToastHost />
    </>
  );
}
