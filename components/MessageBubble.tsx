import React from 'react';
import { Message, Sender } from '../types';

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isSystem = message.sender === Sender.SYSTEM;

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Placeholder */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isUser ? 'bg-indigo-500 ml-2' : 'bg-emerald-500 mr-2'}`}>
          {isUser ? '나' : 'AI'}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-2 rounded-2xl shadow-sm text-sm md:text-base ${
              isUser
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}
          >
            {/* If it's a game move, emphasize the word */}
            {message.word ? (
               <div className="flex flex-col">
                  <span className="font-bold text-lg mb-1">{message.word}</span>
                  {message.definition && (
                     <span className={`text-xs mb-2 ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
                       {message.definition}
                     </span>
                  )}
                  <span>{message.text}</span>
               </div>
            ) : (
               <span>{message.text}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;