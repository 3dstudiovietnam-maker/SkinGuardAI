import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const messages: Record<string, { title: string; body: string; btn: string }> = {
  hu: {
    title: "Mindenki tévedhet, még mi is! 😅",
    body: "Próbáld meg újra, frissítsd a böngészőt!",
    btn: "Frissítés",
  },
  en: {
    title: "Everyone makes mistakes — even us! 😅",
    body: "Please refresh your browser and try again!",
    btn: "Refresh",
  },
  vi: {
    title: "Ai cũng có thể mắc lỗi — kể cả chúng tôi! 😅",
    body: "Hãy thử làm mới trình duyệt của bạn!",
    btn: "Làm mới",
  },
  de: {
    title: "Jeder macht Fehler — auch wir! 😅",
    body: "Bitte aktualisiere deinen Browser und versuche es erneut!",
    btn: "Aktualisieren",
  },
  es: {
    title: "¡Todo el mundo se equivoca — incluso nosotros! 😅",
    body: "¡Por favor, actualiza tu navegador e inténtalo de nuevo!",
    btn: "Actualizar",
  },
  pt: {
    title: "Todos cometem erros — inclusive nós! 😅",
    body: "Por favor, atualize seu navegador e tente novamente!",
    btn: "Atualizar",
  },
  ru: {
    title: "Все ошибаются — даже мы! 😅",
    body: "Пожалуйста, обновите браузер и попробуйте снова!",
    btn: "Обновить",
  },
  hi: {
    title: "हर कोई गलती करता है — हम भी! 😅",
    body: "कृपया अपना ब्राउज़र रीफ्रेश करें और दोबारा कोशिश करें!",
    btn: "रीफ्रेश करें",
  },
  zh: {
    title: "人人都会犯错 — 包括我们！😅",
    body: "请刷新您的浏览器并重试！",
    btn: "刷新",
  },
  th: {
    title: "ทุกคนย่อมทำผิดพลาดได้ — รวมถึงเราด้วย! 😅",
    body: "กรุณารีเฟรชเบราว์เซอร์ของคุณแล้วลองใหม่อีกครั้ง!",
    btn: "รีเฟรช",
  },
  ro: {
    title: "Toată lumea poate greși — inclusiv noi! 😅",
    body: "Vă rugăm să reîncărcați browserul și să încercați din nou!",
    btn: "Reîncărcați",
  },
};

function getMsg() {
  try {
    const lang = localStorage.getItem("language") || navigator.language.slice(0, 2);
    return messages[lang] ?? messages["en"];
  } catch {
    return messages["en"];
  }
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      const msg = getMsg();
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center text-center w-full max-w-md gap-6">
            <div className="text-6xl">🙈</div>
            <h2 className="text-2xl font-semibold">{msg.title}</h2>
            <p className="text-muted-foreground text-lg">{msg.body}</p>
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer transition-opacity"
              )}
            >
              <RefreshCw size={20} />
              {msg.btn}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
