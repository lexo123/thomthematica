import React from 'react';
import { GameMode } from '../types';
import { Button } from './Button';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 md:p-12 text-center space-y-8 border-b-8 border-indigo-200">
        <h1 className="text-4xl font-black text-indigo-900 tracking-tight">
          აირჩიე თამაში 👑
        </h1>
        <div className="grid gap-4">
          <Button 
            onClick={() => onSelectMode(GameMode.Thomthematica)}
            className="text-xl py-6 bg-indigo-600 hover:bg-indigo-700"
          >
            თომთემატიკა
          </Button>
          <Button 
            onClick={() => onSelectMode(GameMode.ThomravlebisTabula)}
            className="text-xl py-6 bg-purple-600 hover:bg-purple-700"
          >
            თომრავლების ტაბულა
          </Button>
          <Button 
            onClick={() => onSelectMode(GameMode.Gethometria)}
            className="text-xl py-6 bg-green-600 hover:bg-green-700"
          >
            გეთომეტრია 📐
          </Button>
          <Button 
            onClick={() => onSelectMode(GameMode.Kveshmicera)}
            className="text-xl py-6 bg-amber-600 hover:bg-amber-700"
          >
            ქვეშმიწერით გამრავლება ✍️
          </Button>
        </div>
      </div>
    </div>
  );
};
