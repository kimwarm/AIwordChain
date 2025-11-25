import React, { useState } from 'react';

interface Props {
  onStartGame: () => void;
}

type ModalType = 'SETTINGS' | 'INFO' | 'CONTACT' | null;

const MainMenu: React.FC<Props> = ({ onStartGame }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const MenuButton = ({ text, onClick, primary = false }: { text: string; onClick: () => void; primary?: boolean }) => (
    <button
      onClick={onClick}
      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
        primary
          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-slate-100'
      }`}
    >
      {text}
    </button>
  );

  const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-slide-up relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
        <div className="text-slate-600 text-sm leading-relaxed">
            {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white/80 backdrop-blur-md relative">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="space-y-2 animate-slide-up">
            <span className="text-6xl mb-4 block">⚡</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              AI 끝말잇기
            </h1>
            <p className="text-indigo-500 font-medium">Gemini 2.5 Flash Edition</p>
        </div>

        <div className="w-full max-w-xs space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <MenuButton text="게임 시작" onClick={onStartGame} primary />
          <MenuButton text="게임 설정" onClick={() => setActiveModal('SETTINGS')} />
          <MenuButton text="게임 정보" onClick={() => setActiveModal('INFO')} />
          <MenuButton text="문의하기" onClick={() => setActiveModal('CONTACT')} />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-slate-400 text-xs">
        © 2025 AI Word Chain. All rights reserved.
      </div>

      {/* Modals */}
      {activeModal === 'SETTINGS' && (
        <Modal title="게임 설정" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span>난이도</span>
                  <span className="text-indigo-600 font-bold">보통</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span>효과음</span>
                  <span className="text-slate-400">준비중</span>
              </div>
              <p className="text-xs text-slate-400 text-center mt-4">더 많은 설정이 곧 추가될 예정입니다!</p>
          </div>
        </Modal>
      )}

      {activeModal === 'INFO' && (
        <Modal title="게임 정보" onClose={() => setActiveModal(null)}>
           <ul className="list-disc list-inside space-y-2">
               <li>Google Gemini 2.5 Flash 모델을 사용합니다.</li>
               <li>두음법칙이 자동으로 적용됩니다. (예: 름 > 음)</li>
               <li>표준국어대사전에 등재된 명사만 사용 가능합니다.</li>
               <li>한 번 사용한 단어는 다시 사용할 수 없습니다.</li>
           </ul>
        </Modal>
      )}

      {activeModal === 'CONTACT' && (
        <Modal title="문의하기" onClose={() => setActiveModal(null)}>
           <p>게임 이용 중 불편한 점이나 건의사항이 있으시면 아래로 연락주세요.</p>
           <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-indigo-700 font-medium text-center">
               support@aiwordchain.com
           </div>
        </Modal>
      )}

    </div>
  );
};

export default MainMenu;
