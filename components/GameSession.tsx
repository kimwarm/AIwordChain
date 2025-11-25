import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, GameState } from '../types';
import { playTurn, getWelcomeMessage } from '../services/geminiService';
import MessageBubble from './MessageBubble';

interface Props {
    onExit: () => void;
}

const GameSession: React.FC<Props> = ({ onExit }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null); // Reference for the input field

  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    history: new Set<string>(),
    lastWord: null,
    lastChar: null,
    turnCount: 0,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input when loading finishes and game is playing
  useEffect(() => {
    if (!isLoading && gameState.isPlaying) {
      // Small timeout ensures the DOM is ready after re-enabling
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isLoading, gameState.isPlaying]);

  // Initial Welcome
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initGame = async () => {
      const welcome = await getWelcomeMessage();
      addMessage(welcome, Sender.AI);
      setGameState(prev => ({ ...prev, isPlaying: true }));
    };
    initGame();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMessage = (text: string, sender: Sender, word?: string, definition?: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      text,
      sender,
      timestamp: Date.now(),
      word,
      definition
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleRestart = () => {
    setMessages([]);
    setGameState({
      isPlaying: true,
      history: new Set<string>(),
      lastWord: null,
      lastChar: null,
      turnCount: 0,
    });
    addMessage("새 게임을 시작합니다! 단어를 입력해주세요.", Sender.SYSTEM);
  };

  const processInput = async (inputValue: string) => {
    if (!inputValue.trim() || isLoading || !gameState.isPlaying) return;

    const userWord = inputValue.trim().replace(/\s+/g, ''); // Remove spaces
    
    // 1. Basic Local Validation (Length)
    if (userWord.length < 2) {
        addMessage("두 글자 이상의 단어를 입력해주세요!", Sender.SYSTEM);
        setInput('');
        return;
    }

    // 2. Check Duplication locally to save API call
    if (gameState.history.has(userWord)) {
        addMessage(`'${userWord}'(은)는 이미 사용된 단어입니다.`, Sender.SYSTEM);
        setInput('');
        return;
    }

    // Update UI immediately
    addMessage("", Sender.USER, userWord);
    setInput('');
    setIsLoading(true);

    // Call API
    const historyArray: string[] = Array.from(gameState.history);
    const result = await playTurn(userWord, gameState.lastWord, historyArray);

    setIsLoading(false);

    if (result.valid) {
      // User played successfully
      const newHistory = new Set(gameState.history);
      newHistory.add(userWord);

      if (result.win) {
         // AI Surrendered
         addMessage(result.reason || "제가 졌습니다! 대단하시네요 🎉", Sender.AI);
         setGameState(prev => ({
             ...prev,
             isPlaying: false,
             gameOverReason: "PLAYER_WIN"
         }));
      } else if (result.word) {
         // AI played back
         newHistory.add(result.word);
         const aiWordLastChar = result.word.slice(-1);
         
         // Add AI Message
         addMessage(
             result.reason || "제 턴입니다!", 
             Sender.AI, 
             result.word, 
             result.definition
         );

         setGameState({
             isPlaying: true,
             history: newHistory,
             lastWord: result.word,
             lastChar: result.dueumLastChar || aiWordLastChar, // Use normalized char if provided
             turnCount: gameState.turnCount + 1
         });
      }
    } else {
        // User word was invalid according to AI
        addMessage(result.reason || "유효하지 않은 단어입니다.", Sender.AI);
        // Do not update game state (turn, history) essentially, user tries again
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    processInput(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle Enter key specifically to avoid CJK composition issues
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
          e.preventDefault();
          processInput(input);
      }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-none md:rounded-2xl overflow-hidden border border-slate-200">
      
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md z-10">
        <div className="flex items-center space-x-3">
            <button onClick={onExit} className="p-1 hover:bg-indigo-500 rounded-lg transition-colors" title="메인 메뉴로 나가기">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="flex items-center space-x-2">
                <span className="text-xl">⚡</span>
                <div>
                    <h1 className="font-bold text-lg leading-tight hidden md:block">AI 끝말잇기</h1>
                </div>
            </div>
        </div>
        <div className="text-right flex items-center space-x-3">
             {gameState.lastChar && gameState.isPlaying && (
                 <div className="text-xs px-2 py-1 bg-indigo-800/50 rounded border border-indigo-400/30 text-yellow-300 font-bold">
                    시작: {gameState.lastChar}
                 </div>
             )}
             <div className="text-xs font-medium bg-indigo-700 px-2 py-1 rounded shadow-sm">
                {gameState.turnCount} 턴
             </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative">
        {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 opacity-50">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                <p>게임을 시작하려면 인사를 건네거나 단어를 입력하세요!</p>
             </div>
        )}
        
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4 animate-fade-in">
             <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Game Over Overlay */}
      {!gameState.isPlaying && messages.length > 0 && (
          <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-sm mx-4 animate-slide-up">
                  <div className="text-4xl mb-4">
                      {gameState.gameOverReason === 'PLAYER_WIN' ? '🏆' : '👾'}
                  </div>
                  <h2 className="text-xl font-bold mb-2">게임 종료</h2>
                  <p className="text-slate-600 mb-6">
                      {gameState.gameOverReason === 'PLAYER_WIN' 
                        ? '축하합니다! AI를 이기셨어요!' 
                        : '게임이 끝났습니다.'}
                  </p>
                  <div className="space-y-2">
                      <button 
                        onClick={handleRestart}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                      >
                        다시 시작하기
                      </button>
                      <button 
                        onClick={onExit}
                        className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold py-3 px-4 rounded-xl transition-colors"
                      >
                        메뉴로 나가기
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || !gameState.isPlaying}
            placeholder={gameState.lastChar ? `'${gameState.lastChar}'(으)로 시작하는 단어` : "단어를 입력하세요..."}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50 ime-mode-active"
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !gameState.isPlaying}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-200 disabled:shadow-none flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameSession;