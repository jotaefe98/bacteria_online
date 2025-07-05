import { useState } from "react";

type InsertNicknameProps = {
  onNicknameSubmit: (nickname: string) => void;
};

export default function InsertNickname({
  onNicknameSubmit,
}: InsertNicknameProps) {
    
  const [tempNickname, setTempNickname] = useState<string>("");

  const handleSubmit = () => {
    if (tempNickname.trim()) {
      onNicknameSubmit(tempNickname.trim());
      setTempNickname("");
    }
  };

  return (
    <div className="room">
      <h2>Introduce tu nickname para entrar a la sala</h2>
      <input
        type="text"
        placeholder="Tu nickname"
        value={tempNickname}
        onChange={(e) => setTempNickname(e.target.value)}
      />
      <button
        onClick={() => {
          if (tempNickname.trim()) {
            handleSubmit();
          }
        }}
      >
        Entrar
      </button>
    </div>
  );
}
