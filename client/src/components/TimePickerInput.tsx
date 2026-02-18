import { Input } from "@/components/ui/input";

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export function TimePickerInput({ value, onChange, disabled, id }: TimePickerInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Auto-format as user types
    if (val.length === 2 && !val.includes(":")) {
      val = val + ":";
    } else if (val.length === 5 && val.match(/^\d{2}:\d{2}$/)) {
      val = val + ":";
    }
    
    // Ensure format is HH:MM:SS
    if (val && /^\d{2}:\d{2}:\d{2}$/.test(val)) {
      onChange(val);
    } else if (val === "") {
      onChange("");
    } else if (/^\d{0,2}$|^\d{2}:\d{0,2}$|^\d{2}:\d{2}:\d{0,2}$/.test(val)) {
      // Allow partial input while typing
      onChange(val);
    }
  };

  return (
    <Input
      id={id}
      type="text"
      placeholder="HH:MM:SS"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      maxLength={8}
      pattern="\d{2}:\d{2}:\d{2}"
      className="font-mono"
    />
  );
}
