import { useState } from "react";
import { validateNickname } from "../../utils/validation";
import toast from "react-hot-toast";
import "./InsertNickname.css";

type InsertNicknameProps = {
  onNicknameSubmit: (nickname: string) => void;
};

export default function InsertNickname({
  onNicknameSubmit,
}: InsertNicknameProps) {
  const [tempNickname, setTempNickname] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempNickname.trim();

    if (!trimmed) {
      toast.error("Please enter a nickname");
      return;
    }

    const validation = validateNickname(trimmed);
    if (!validation.isValid) {
      toast.error(validation.error!);
      return;
    }

    onNicknameSubmit(trimmed);
    setTempNickname("");
    window.location.reload();
  };

  return (
    <div className="nickname-container">
      <div className="nickname-card">
        <div className="card-header">
          <div className="bacteria-icon">🦠</div>
          <h2>Join the Battle!</h2>
          <p>Enter your nickname to enter the room</p>
        </div>

        <form onSubmit={handleSubmit} className="nickname-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Your nickname"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              className="nickname-input"
              maxLength={20}
              autoFocus
            />
            <button
              type="submit"
              className="enter-button"
              disabled={!tempNickname.trim()}
            >
              <span className="button-icon">🚀</span>
              Enter Room
            </button>
          </div>

          <div className="input-hint">
            Choose a unique nickname (max 20 characters)
          </div>
        </form>
      </div>
    </div>
  );
}
