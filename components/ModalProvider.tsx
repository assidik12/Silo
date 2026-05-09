'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type ModalType = 'success' | 'error' | 'info' | 'confirm';

interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalContextProps {
  showModal: (options: ModalOptions) => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const showModal = (opts: ModalOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (options?.onConfirm) options.onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (options?.onCancel) options.onCancel();
    setIsOpen(false);
  };

  return (
    <ModalContext.Provider value={{ showModal }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform scale-100 transition-all flex flex-col items-center animate-in fade-in zoom-in duration-200">
            {options.type === 'error' && <AlertCircle className="w-16 h-16 text-red-500 mb-4" />}
            {options.type === 'success' && <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />}
            {(options.type === 'info' || !options.type || options.type === 'confirm') && <Info className="w-16 h-16 text-indigo-500 mb-4" />}
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{options.title}</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">{options.message}</p>
            
            {options.type === 'confirm' ? (
              <div className="flex gap-3 w-full">
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
                >
                  Ya, Lanjutkan
                </button>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-colors ${
                  options.type === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 shadow-green-200 shadow-md' 
                    : options.type === 'error'
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200 shadow-md'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-md'
                }`}
              >
                OK, Mengerti
              </button>
            )}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};
