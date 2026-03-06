import React, { useEffect, useState, useRef } from 'react';
import { GameState } from '../types';
import { Button } from './Button';

// --------------------------------------------------------------------------
//  ⚙️ სურათების და ტექსტების კონფიგურაცია
// --------------------------------------------------------------------------

interface ImageConfig {
  url: string;
  caption: string;
}

// სუპერ გამარჯვებულის გიფები (გამოჩნდება ყოველ მე-3 მოგებულ ბლოკზე)
const SUPER_WINNER_GIFS: ImageConfig[] = [
  {
    url: "https://drive.google.com/file/d/1Dp9FZeA9cAzUzEP8nO-nBp-jOYgJOdeX/view?usp=sharing", // tiger
    caption: "ბრავისიმოოო!!!"
  },
  {
    url: "https://drive.google.com/file/d/1lo4jEZ5Cz6WMOl9ZCUNuELaoWnjtYRML/view?usp=sharing", // soldiers
    caption: "ბრავისიმოოო!!!"
  },
  {
    url: "https://drive.google.com/file/d/1PEsKskC5sP_ZncfDNZAOtf0tmqcggddp/view?usp=sharing", // polo
    caption: "ბრავისიმოოო!!!"
  },
  {
    url: "https://drive.google.com/file/d/1xxvpG-FYy4M98dIuIJQqxsn6QFqfJbL2/view?usp=sharing", // goal
    caption: "ბრავისიმოოო!!!"
  },
  {
    url: "https://drive.google.com/file/d/1xoubVinL5ZPBjCZl4S5jYAqaYPBxeeE8/view?usp=sharing", // zeus
    caption: "ბრავისიმოოო!!!"
  },
  {
    url: "https://drive.google.com/file/d/1EcAkQLz4livegrKqcESsvJada5T6gYW5/view?usp=sharing", // juggle
    caption: "ბრავისიმოოო!!!"
  },
  
];

// გამარჯვებულის სურათები და ტექსტები
const WINNER_IMAGES: ImageConfig[] = [
  { 
    url: "https://drive.google.com/file/d/1wuXKSsGy0YgLtw_oElyzRUYWs60h66ct/view?usp=sharing", 
    caption: "მათემატიკის ნამდვილი მეფე ხარ" // king
  },
  { 
    url: "https://drive.google.com/file/d/1GmKTOLfDKndVKGOlcSc9R9bIkSMxtEsJ/view?usp=sharing", 
    caption: "მათემატიკის სუპერმენი ხარ" // superman
  },
  { 
    url: "https://drive.google.com/file/d/1SAng62kOsbQ8HM984tT0E6lZwcmWdJeT/view?usp=sharing", 
    caption: "შენ თომა კვარაცხელია ხარ თუ ხვიჩა მურალაშვილი?" // psg
  },
  { 
    url: "https://drive.google.com/file/d/1XO7mk8d2WywFRdk9L6QK7gG7NPIOM_5F/view?usp=sharing", 
    caption: "შენ ყოფილხარ მათემატიკის რაინდი" // knight
  },
  { 
    url: "https://drive.google.com/file/d/1ZXqSW6eUqqO4bKusOmHFgrBJsKkdYFjY/view?usp=sharing", 
    caption: "მათემატიკტყაოსანი ხარ" // tiger
  },
  { 
    url: "https://drive.google.com/file/d/11rUHbjmmeHhEUKqAPSgkUwjTRDZpjTzs/view?usp=sharing", 
    caption: "ნამდვილი ჯარისკაცი ხარ. ლეიტენანტი ბახტა შენით ამაყობს" // soldier
  },
  { 
    url: "https://drive.google.com/file/d/1dOFwv6Mfx_7OkqkzJf2RnsUc46kltmAe/view?usp=sharing", 
    caption: "ყოჩაღ, პროფესორო თომა" // professor
  },
  { 
    url: "https://drive.google.com/file/d/1MWiGBhZqQSiCwfKpo6IB3p_7e7YQaIWB/view?usp=sharing", 
    caption: "უძლიერესი ხარ" // strong
  },
  { 
    url: "https://drive.google.com/file/d/1JQNqDpspGagpwNP02GpJY6IsRGGNyb-b/view?usp=sharing", 
    caption: "მათემატიკის ბეტმენი ხარ" // batman
  },
  { 
    url: "https://drive.google.com/file/d/1iDtpwiLh_F-VpgQLo21LWFxwIwviefk1/view?usp=sharing", 
    caption: "მათემატიკის დეტექტივი" // zootopia
  },
  { 
    url: "https://drive.google.com/file/d/1JVHpVp8iaB1Mj-naheUfesmfHsVhrgyh/view?usp=sharing", 
    caption: "ნუ თომა, ნუ პაგაძი" // nupagadi
  },  
  { 
    url: "https://drive.google.com/file/d/1OiizhAU7IJ2ZsUECfthoycFbdppt-gW6/view?usp=sharing", 
    caption: "მათემატიკის ზევსი" // zeus
  },
  { 
    url: "https://drive.google.com/file/d/1kluZR-WRbdrXGOzYOJR9i7dZUq6xWWf-/view?usp=sharing", 
    caption: "მათემატიკის პრეზიდენტი ხარ" // president
  },
  { 
    url: "https://drive.google.com/file/d/1k2tpbvOBiS1ADxB_xsbk2CK9UcMPYL7m/view?usp=sharing", 
    caption: "სპაიდერმენ, სპაიდერმეეენ!!!" // president
  },

];

// დამარცხებულის სურათები და ტექსტები
const LOSER_IMAGES: ImageConfig[] = [
  { 
    url: "https://drive.google.com/file/d/1ZSrOpoyQqp13MQ4RAQPeYxNdbAJglb1I/view?usp=sharing", 
    caption: "ყველა ვერ გამოიცანი, კლოუნი ყოფილხარ" // clown
  },
  { 
    url: "https://drive.google.com/file/d/11VR2sOq3KNw9l2WAr5UtH97eL7YGaTmk/view?usp=sharing", 
    caption: "მათემატიკოსი კი არა უბრალოდ მსუქანა ხარ" // fat
  },
  { 
    url: "https://drive.google.com/file/d/1Hn3RgRadJxLLNGbtnYe7Oh-9Ystvf-tg/view?usp=sharing", 
    caption: "შენ ხარ მათემატიკური მაიმუნი" // monkey
  },
  { 
    url: "https://drive.google.com/file/d/1SwDkzkYocvgCy1x0iOE0SBRhHDpoOYN6/view?usp=sharing", 
    caption: "მათემატიკოსი კი არა უკბილო ბებრუხანა ხარ" // old
  }, 
  { 
    url: "https://drive.google.com/file/d/1x1ajsCEDGTdu7ZFM-3uXHv4BXWNjYX8U/view?usp=sharing", 
    caption: "მათემატიკოსი კი არა ღორის გრიპი ხარ" // ill
  },
  { 
    url: "https://drive.google.com/file/d/1advIeiLRl-4HShkIh13SVhUP_uAG6L3G/view?usp=sharing", 
    caption: "ვის აუცურდა ფეხი ბანანის ქერქზე?" // banana
  },
  { 
    url: "https://drive.google.com/file/d/137ecw5X7XBn3fsTw6oplzVBX-cKlOlsS/view?usp=sharing", 
    caption: "ხო ხედავ ამდენი თამაშისგან თავი ტელეფონად გადაგექცა" // phone
  },
  { 
    url: "https://drive.google.com/file/d/1irvOffR2cR3L6Kj_qO9TGCto_1eRUhFo/view?usp=sharing", 
    caption: "თომთემატიკას თუ არ ისწავლი ასეთი გახდები" // homeless
  },

];

// სათადარიგო GIF, თუ რამე გაფუჭდა
const FALLBACK_GIF = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2lsaG1oMnB6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYt5jPR6QX5pnqM/giphy.gif";

const getDriveId = (url: string) => {
  if (!url) return null;
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([-_\w]+)/;
  const match = url.match(driveRegex);
  return match && match[1] ? match[1] : null;
};

const getDirectLink = (url: string) => {
  if (!url || !url.includes('drive.google.com')) return url;
  const id = getDriveId(url);
  if (!id) return url;
  // Google Drive-ის ლინკების პირდაპირ გახსნა
  return `https://lh3.googleusercontent.com/d/${id}`;
};

interface ResultOverlayProps {
  gameState: GameState;
  onReset: () => void;
  correctAnswer: number;
  message: string;        
  showImage: boolean;     
  isPerfectBlock: boolean; // იყო თუ არა 3-ვე პასუხი სწორი
  consecutivePerfectBlocks: number; // რამდენი ბლოკი გამოიცნო ზედიზედ შეცდომის გარეშე
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({ 
  gameState, 
  onReset, 
  correctAnswer, 
  message,
  showImage,
  isPerfectBlock,
  consecutivePerfectBlocks
}) => {
  const [showContent, setShowContent] = useState(false);
  
  // ვინახავთ აქტიურ სურათს და მის შესაბამის ტექსტს
  const [activeImgData, setActiveImgData] = useState<{src: string, caption: string} | null>(null);
  const [imageError, setImageError] = useState(false);

  // აუზები (Pools) სურათების შესანახად
  // თავდაპირველად ივსება სრული სიით. როცა სურათი გამოიყენება, იშლება სიიდან.
  // როცა სია ცარიელდება, ივსება თავიდან.
  const winnerPool = useRef<ImageConfig[]>([...WINNER_IMAGES]);
  const loserPool = useRef<ImageConfig[]>([...LOSER_IMAGES]);
  const superGifPool = useRef<ImageConfig[]>([...SUPER_WINNER_GIFS]);

  const isCorrect = gameState === GameState.Correct;

  // Enter-ზე დაჭერის ლოგიკა
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReset]);

  // დამხმარე ფუნქცია აუზიდან სურათის ამოსაღებად
  const selectImageFromPool = (poolRef: React.MutableRefObject<ImageConfig[]>, originalSource: ImageConfig[]) => {
    // თუ აუზი ცარიელია, გავავსოთ თავიდან
    if (poolRef.current.length === 0) {
      poolRef.current = [...originalSource];
    }
    
    // ავირჩიოთ რანდომ ინდექსი
    const randomIndex = Math.floor(Math.random() * poolRef.current.length);
    const selected = poolRef.current[randomIndex];
    
    // წავშალოთ არჩეული ელემენტი აუზიდან (რომ აღარ განმეორდეს სანამ არ დაიცლება)
    poolRef.current.splice(randomIndex, 1);
    
    return selected;
  };

  // სურათის ლოგიკა
  useEffect(() => {
    if (!showImage) return;

    let selectedItem: ImageConfig;

    // 1. განვსაზღვრავთ რომელი აუზიდან ამოვიღოთ
    if (!isPerfectBlock) {
      selectedItem = selectImageFromPool(loserPool, LOSER_IMAGES);
    } else if (consecutivePerfectBlocks > 0 && consecutivePerfectBlocks % 3 === 0) {
      // ყოველი მე-3 სუფთა ბლოკი -> გიფი
      selectedItem = selectImageFromPool(superGifPool, SUPER_WINNER_GIFS);
    } else {
      // ჩვეულებრივი მოგება
      selectedItem = selectImageFromPool(winnerPool, WINNER_IMAGES);
    }

    const finalSrc = getDirectLink(selectedItem.url);
    
    setActiveImgData({
      src: finalSrc,
      caption: selectedItem.caption
    });
    setImageError(false);
  }, [showImage, isPerfectBlock, consecutivePerfectBlocks]);

  const titleColor = isCorrect ? 'text-green-600' : 'text-red-600';
  const bgColor = isCorrect ? 'bg-green-500/90' : 'bg-red-500/90';

  useEffect(() => {
    if (gameState === GameState.Playing) {
      setShowContent(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [gameState]);

  if (gameState === GameState.Playing) return null;

  // ტექსტის არჩევა: თუ სურათი ჩანს, ვიღებთ სურათის ტექსტს, თუ არა - ზოგად მესიჯს
  const displayMessage = (showImage && activeImgData) ? activeImgData.caption : message;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${bgColor} transition-colors duration-500`}>
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-5xl w-full shadow-2xl text-center transform animate-bounce-short flex flex-col items-center">
        
        {/* მთავარი მესიჯი */}
        <h2 className={`text-2xl md:text-4xl font-black mb-8 ${titleColor} leading-tight`}>
          {displayMessage}
        </h2>

        {/* სურათი ჩნდება მხოლოდ მე-3 კითხვაზე (როცა showImage true-ა) */}
        {showContent && showImage && activeImgData && (
          <div className={`relative w-full h-[50vh] md:h-[60vh] mb-8 rounded-2xl overflow-hidden border-4 ${isPerfectBlock ? 'border-yellow-400' : 'border-gray-500'} shadow-xl bg-gray-100 flex items-center justify-center animate-fade-in-up`}>
            {!imageError ? (
              <img 
                key={activeImgData.src}
                src={activeImgData.src} 
                alt="შედეგი" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={() => {
                  console.warn("სურათი ვერ ჩაიტვირთა, ირთვება fallback");
                  if (activeImgData.src !== FALLBACK_GIF) {
                     setActiveImgData({ ...activeImgData, src: FALLBACK_GIF });
                  } else {
                     setImageError(true);
                  }
                }}
              />
            ) : (
              <div className="text-9xl select-none">
                {isPerfectBlock ? '👑' : '🥀'}
              </div>
            )}
          </div>
        )}

        <Button onClick={onReset} className="w-full text-2xl py-5 shadow-lg">
          {isCorrect ? 'შემდეგი' : 'თავიდან სცადე'}
        </Button>
      </div>
    </div>
  );
};
