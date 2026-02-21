import { Input } from "@/components/ui/input";

interface TimePickerSeparateProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export function TimePickerSeparate({ value, onChange, disabled, id }: TimePickerSeparateProps) {
  // Parse HH:MM:SS format
  const [hours, minutes, seconds] = value.split(":").length === 3 
    ? value.split(":") 
    : ["00", "00", "00"];

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let h = e.target.value;
    // Validate hour (0-23)
    if (h === "") h = "00";
    const num = parseInt(h, 10);
    if (num >= 0 && num <= 23) {
      h = String(num).padStart(2, "0");
      onChange(`${h}:${minutes}:${seconds}`);
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let m = e.target.value;
    // Validate minute (0-59)
    if (m === "") m = "00";
    const num = parseInt(m, 10);
    if (num >= 0 && num <= 59) {
      m = String(num).padStart(2, "0");
      onChange(`${hours}:${m}:${seconds}`);
    }
  };

  const handleSecondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let s = e.target.value;
    // Validate second (0-59)
    if (s === "") s = "00";
    const num = parseInt(s, 10);
    if (num >= 0 && num <= 59) {
      s = String(num).padStart(2, "0");
      onChange(`${hours}:${minutes}:${s}`);
    }
  };

  return (
    <div id={id} className="flex gap-2 items-center">
      <div className="flex-1">
        <Input
          type="number"
          min="0"
          max="23"
          value={hours}
          onChange={handleHourChange}
          disabled={disabled}
          placeholder="HH"
          className="font-mono text-center"
        />
        <p className="text-xs text-muted-foreground text-center mt-1">Hour</p>
      </div>
      <div className="text-xl font-bold">:</div>
      <div className="flex-1">
        <Input
          type="number"
          min="0"
          max="59"
          value={minutes}
          onChange={handleMinuteChange}
          disabled={disabled}
          placeholder="MM"
          className="font-mono text-center"
        />
        <p className="text-xs text-muted-foreground text-center mt-1">Minute</p>
      </div>
      <div className="text-xl font-bold">:</div>
      <div className="flex-1">
        <Input
          type="number"
          min="0"
          max="59"
          value={seconds}
          onChange={handleSecondChange}
          disabled={disabled}
          placeholder="SS"
          className="font-mono text-center"
        />
        <p className="text-xs text-muted-foreground text-center mt-1">Second</p>
      </div>
    </div>
  );
}
